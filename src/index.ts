import { createCanvas, loadImage, registerFont } from 'canvas';
import { join } from 'path';
import * as express from 'express';
import * as bp from 'body-parser';

registerFont(join(__dirname, 'assets', 'Lato-Black.ttf'), { family: 'Lato-Bold', style: 'bold', weight: 'bold' });
registerFont(join(__dirname, 'assets', 'Lato-Regular.ttf'), { family: 'Lato', style: 'normal', weight: 'normal' });

const app = express();

const cutText = (ctx, text: string, width: number) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < 630) {
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

const roundImage = (image, size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(image, 0, 0, size, size);

  return canvas;
};

app.post('/wh', bp.json(), async (req: express.Request, res: express.Response) => {
  const event = req.headers['x-github-event'];
  console.log(JSON.stringify({
    ...req.body,
    event
  }, null, 2));


  if (event === 'push') {
    const canvas = createCanvas(1000, 500);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, 1000, 500);

    ctx.fillStyle = '#586069';
    ctx.font = '25px Lato';
    ctx.fillText('OneAndOnlyFinbar/discork', 70, 70);

    ctx.font = '15px Lato';
    ctx.fillText('on branch', 72, 70 + 18);

    ctx.fillStyle = '#47494c';
    ctx.font = '15px Lato-Bold';
    ctx.fillText('master', 72 + ctx.measureText('on branch').width - 5, 70 + 18);

    ctx.fillStyle = '#2f363d';
    ctx.font = 'bold 40px Lato-Bold';

    const lines = cutText(ctx, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod', 630);
    lines.forEach((line, index) => {
      ctx.fillText(line, 70, 140 + (index * 50));
    });

    const img = await loadImage(join(__dirname, 'assets', 'changed-file-icon.png'));
    ctx.drawImage(img, 70, 140 + lines.length * 50, 24, 28);

    ctx.fillStyle = '#6e7681';
    ctx.font = '25px Lato';
    ctx.fillText('15 Lines changed', 70 + 24 + 10, 140 + lines.length * 50 + 25);

    ctx.fillStyle = '#22863a';
    ctx.font = '25px Lato-Bold';
    ctx.fillText('+50', 70 + 24 + 10 + ctx.measureText('15 Lines changed').width, 140 + lines.length * 50 + 25);

    ctx.fillStyle = '#cb2431';
    ctx.fillText('-10', 70 + 24 + 10 + ctx.measureText('15 Lines changed').width + ctx.measureText('+50').width + 15, 140 + lines.length * 50 + 25);

    let additionPercentage = 80;
    const percentageStartX = 70 + 24 + 10 + ctx.measureText('15 Lines changed').width + ctx.measureText('+50').width + 15 + ctx.measureText('-10').width + 20;
    const percentageStartY = 140 + lines.length * 50 + 5;

    for (let i = 0; i < 5; i++) {
      if (additionPercentage >= 20) {
        ctx.fillStyle = '#2cbe4e';
        ctx.fillRect(percentageStartX + i * 30, percentageStartY, 20, 20);
        additionPercentage -= 20;
      } else {
        ctx.fillStyle = '#c92431';
        ctx.fillRect(percentageStartX + i * 30, percentageStartY, 20, 20);
      }
    }

    const committerSmallPFP = await loadImage(join(__dirname, 'assets', 'PFP.jpg'));
    ctx.drawImage(roundImage(committerSmallPFP, committerSmallPFP.width), 70, 500 - 20 - 90, 50, 50);
    ctx.drawImage(roundImage(committerSmallPFP, committerSmallPFP.width), 1000 - 20 - 150, 50, 120, 120);

    ctx.fillStyle = 'black';
    ctx.font = '25px Lato-Bold';
    ctx.fillText('OneAndOnlyFinbar', 70 + 50 + 15, 500 - 20 - 90 + 25 + 10);

    ctx.fillStyle = '#586069';
    ctx.font = '25px Lato';
    ctx.fillText('committed July 14th, 2023', 70 + 50 + 15 + ctx.measureText('OneAndOnlyFinbar').width + 40, 500 - 20 - 90 + 25 + 10);

    ctx.fillStyle = '#47494c';
    ctx.font = '25px Lato';
    ctx.fillText('6246b8f', 1000 - 50 - ctx.measureText('6246b8f').width, 500 - 20 - 90 + 25 + 10);

    ctx.fillStyle = '#1e77e1';
    ctx.fillRect(0, 480, 1000, 20);
  }

  res
    .status(200)
    .send('OK')
    .end();
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});