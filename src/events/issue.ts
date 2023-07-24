import { createCanvas, loadImage } from 'canvas';
import { cutText, roundImage } from '../utils';
import { join } from 'path';
import * as fs from 'fs';
import axios from 'axios';
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