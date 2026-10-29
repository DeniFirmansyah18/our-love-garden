import * as THREE from 'three';
import { domeGeometry } from './toon';

export type Expression = 'happy' | 'shy' | 'surprised' | 'sleepy' | 'love' | 'teary' | 'neutral';

export interface FaceStyle {
  ink: string;
  mouth: string;
  tongue: string;
  tear: string;
}

const SIZE = 256;

interface FacePoint {
  x: number;
  y: number;
}

const EYE_LEFT: FacePoint = { x: 64, y: 120 };
const EYE_RIGHT: FacePoint = { x: 192, y: 120 };
const EYE_RADIUS = 17;

/**
 * Faces are painted to a canvas so an expression swap is a texture swap.
 * One texture per expression (plus a closed-eye variant) is cheap and keeps
 * the character meshes untouched.
 */
export class Face {
  readonly mesh: THREE.Mesh;
  private readonly textures = new Map<string, THREE.CanvasTexture>();
  private readonly material: THREE.MeshBasicMaterial;
  private expression: Expression = 'neutral';
  private closed = false;
  private style: FaceStyle;

  constructor(radius: number, style: FaceStyle) {
    this.style = style;
    const width = radius * 1.75;
    const geometry = domeGeometry(width, width * 0.92, radius * 0.18);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = 2;
    this.setExpression('neutral');
  }

  setExpression(expression: Expression): void {
    this.expression = expression;
    this.apply();
  }

  setClosed(closed: boolean): void {
    if (this.closed === closed) return;
    this.closed = closed;
    this.apply();
  }

  setStyle(style: FaceStyle): void {
    this.style = style;
    this.textures.clear();
    this.apply();
  }

  dispose(): void {
    this.textures.forEach((texture) => texture.dispose());
    this.textures.clear();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }

  private apply(): void {
    const key = `${this.expression}:${this.closed ? 'closed' : 'open'}`;
    let texture = this.textures.get(key);
    if (!texture) {
      texture = new THREE.CanvasTexture(this.paint(this.expression, this.closed));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 2;
      texture.needsUpdate = true;
      this.textures.set(key, texture);
    }
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private paint(expression: Expression, closed: boolean): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.style.ink;
    ctx.fillStyle = this.style.ink;

    const blink = closed || expression === 'sleepy';
    if (blink) this.paintClosedEyes(ctx);
    else if (expression === 'love') this.paintHeartEyes(ctx);
    else if (expression === 'happy') this.paintHappyEyes(ctx);
    else this.paintRoundEyes(ctx, expression === 'surprised' ? 1.16 : 1);

    this.paintMouth(ctx, expression);
    if (expression === 'teary') this.paintTears(ctx);
    if (expression === 'shy') this.paintBrows(ctx);
    return canvas;
  }

  private paintRoundEyes(ctx: CanvasRenderingContext2D, scale: number): void {
    for (const eye of [EYE_LEFT, EYE_RIGHT]) {
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, EYE_RADIUS * scale, EYE_RADIUS * 1.08 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 250, 242, 0.92)';
      ctx.arc(eye.x - 4.5, eye.y - 5, 4.6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.style.ink;
    }
  }

  private paintHappyEyes(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 6;
    for (const eye of [EYE_LEFT, EYE_RIGHT]) {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y + 5, EYE_RADIUS, Math.PI * 1.14, Math.PI * 1.86);
      ctx.stroke();
    }
  }

  private paintClosedEyes(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 6;
    for (const eye of [EYE_LEFT, EYE_RIGHT]) {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y - 4, EYE_RADIUS, Math.PI * 0.16, Math.PI * 0.84);
      ctx.stroke();
    }
  }

  private paintHeartEyes(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#d5566e';
    for (const eye of [EYE_LEFT, EYE_RIGHT]) {
      const size = 20;
      ctx.beginPath();
      ctx.moveTo(eye.x, eye.y + size * 0.85);
      ctx.bezierCurveTo(
        eye.x - size * 1.25,
        eye.y + size * 0.1,
        eye.x - size * 0.85,
        eye.y - size * 0.95,
        eye.x,
        eye.y - size * 0.35
      );
      ctx.bezierCurveTo(
        eye.x + size * 0.85,
        eye.y - size * 0.95,
        eye.x + size * 1.25,
        eye.y + size * 0.1,
        eye.x,
        eye.y + size * 0.85
      );
      ctx.fill();
    }
    ctx.fillStyle = this.style.ink;
  }

  private paintMouth(ctx: CanvasRenderingContext2D, expression: Expression): void {
    const cx = SIZE / 2;
    const my = 162;
        ctx.lineWidth = 6.5;

    if (expression === 'happy' || expression === 'love') {
      ctx.beginPath();
      ctx.moveTo(cx - 15, my - 2);
      ctx.quadraticCurveTo(cx, my + 20, cx + 15, my - 2);
      ctx.closePath();
      ctx.fillStyle = this.style.mouth;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, my + 11, 8, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.style.tongue;
      ctx.fill();
      ctx.strokeStyle = this.style.ink;
      ctx.beginPath();
      ctx.moveTo(cx - 15, my - 2);
      ctx.quadraticCurveTo(cx, my + 20, cx + 15, my - 2);
      ctx.stroke();
      return;
    }

    if (expression === 'surprised') {
      ctx.beginPath();
      ctx.ellipse(cx, my + 4, 8, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.style.ink;
      ctx.fill();
      return;
    }

    if (expression === 'sleepy') {
      ctx.beginPath();
      ctx.moveTo(cx - 9, my + 2);
      ctx.quadraticCurveTo(cx, my + 9, cx + 9, my + 2);
      ctx.stroke();
      return;
    }

    if (expression === 'shy') {
      ctx.beginPath();
      ctx.moveTo(cx - 13, my + 2);
      ctx.quadraticCurveTo(cx - 6, my + 8, cx, my + 2);
      ctx.quadraticCurveTo(cx + 6, my - 4, cx + 13, my + 2);
      ctx.stroke();
      return;
    }

    if (expression === 'teary') {
      ctx.beginPath();
      ctx.moveTo(cx - 12, my + 6);
      ctx.quadraticCurveTo(cx, my - 4, cx + 12, my + 6);
      ctx.stroke();
      return;
    }

    // Neutral "u" smile.
    ctx.beginPath();
    ctx.moveTo(cx - 11, my);
    ctx.quadraticCurveTo(cx, my + 14, cx + 11, my);
    ctx.stroke();
  }

  private paintTears(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.style.tear;
    for (const [x, y, scale] of [
      [EYE_LEFT.x - 4, EYE_LEFT.y + 26, 1],
      [EYE_RIGHT.x + 5, EYE_RIGHT.y + 34, 0.8]
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(x, y - 12 * scale);
      ctx.quadraticCurveTo(x + 8 * scale, y + 2 * scale, x, y + 12 * scale);
      ctx.quadraticCurveTo(x - 8 * scale, y + 2 * scale, x, y - 12 * scale);
      ctx.fill();
    }
  }

  private paintBrows(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(74, 31, 26, 0.55)';
    for (const [eye, dir] of [
      [EYE_LEFT, 1],
      [EYE_RIGHT, -1]
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(eye.x - 12 * dir, eye.y - 30);
      ctx.quadraticCurveTo(eye.x, eye.y - 36, eye.x + 12 * dir, eye.y - 29);
      ctx.stroke();
    }
    ctx.strokeStyle = this.style.ink;
  }
}