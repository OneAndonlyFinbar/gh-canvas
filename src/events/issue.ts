import { createCanvas, loadImage } from 'canvas';
import { cutText, hexToRgb, roundImage } from '../utils';
import { join } from 'path';
import * as fs from 'fs';

const GithubColors = require('github-colors');

export default async function Issue(req, res) {
  const canvas = createCanvas(1000, 500);
  const { issue, repository } = req.body;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, 1000, 500);

  ctx.fillStyle = '#586069';
  ctx.font = '25px Lato';
  ctx.fillText(repository.full_name, 70, 70);

  ctx.fillStyle = '#2f363d';
  ctx.font = 'bold 40px Lato-Bold';

  const lines = cutText(ctx, issue.title, 630);
  lines.forEach((line, index) => {
    ctx.fillText(line, 70, 140 + (index * 50));
  });

  const { labels } = issue;

  ctx.font = '20px Lato';

  let nextLabelX = 70;
  let nextLabelY = 300;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const { name, color } = label;

    const width = ctx.measureText(name).width + 30;
    const height = 30;

    if (nextLabelX + width > 1000) {
      if(nextLabelY + height > 500 - 20 - 90) break;
      nextLabelX = 70;
      nextLabelY += height + 10;
    }

    ctx.fillStyle = `#${color}`;

    ctx.beginPath();
    ctx.moveTo(nextLabelX, nextLabelY);
    ctx.lineTo(nextLabelX + width, nextLabelY);
    ctx.lineTo(nextLabelX + width - 10, nextLabelY + height);
    ctx.lineTo(nextLabelX - 10, nextLabelY + height);
    ctx.closePath();
    ctx.fill();

    const colorRGB = hexToRgb(color);

    ctx.fillStyle = (colorRGB.r + colorRGB.g + colorRGB.b) / 3 > 255 /2 ? '#000' : '#FFF';
    ctx.fillText(name, nextLabelX + 15 / 2, nextLabelY + 22);

    nextLabelX += width + 10;
  }

  const profilePicture = await loadImage(issue.user.avatar_url);
  ctx.drawImage(roundImage(profilePicture, profilePicture.width), 70, 500 - 20 - 90, 50, 50);
  ctx.drawImage(roundImage(profilePicture, profilePicture.width), 1000 - 20 - 150, 50, 120, 120);

  ctx.fillStyle = 'black';
  ctx.font = '25px Lato-Bold';

  const username = issue.user.login;
  const usernameWidth = ctx.measureText(username).width;

  ctx.fillText(username, 70 + 50 + 15, 500 - 20 - 90 + 25 + 10);

  const date = new Date(issue.created_at);
  const dateString = `${date.toLocaleString('en-us', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;

  ctx.fillStyle = '#586069';
  ctx.font = '25px Lato';
  ctx.fillText(`opened on ${dateString}`, 70 + 50 + 15 + usernameWidth + 10, 500 - 20 - 90 + 25 + 10);

  const issueId = `#${issue.number}`;

  ctx.fillText(issueId, 1000 - 50 - ctx.measureText(issueId).width, 500 - 20 - 90 + 25 + 10);

  fs.writeFileSync(join(__dirname, 'issue_test.png'), canvas.toBuffer());
}