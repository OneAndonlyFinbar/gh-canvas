import { createCanvas } from 'canvas';

export const cutText = (ctx, text: string, maxWidth: number) => {
  text = text.replace(/\n\n/g, ' ');
  text = text.replace(/\r\n/g, ' ');
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      if (lines.length < 2) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += '...';
        break;
      }
    }
  }
  lines.push(currentLine);
  return lines;
};

export const roundImage = (image, size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(image, 0, 0, size, size);

  return canvas;
};

export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return {
    r,
    g,
    b
  }
}