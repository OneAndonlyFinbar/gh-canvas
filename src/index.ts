import { createCanvas, loadImage, registerFont } from 'canvas';
import { join } from 'path';
import * as express from 'express';
import * as bp from 'body-parser';
import axios from 'axios';
import 'dotenv/config';
import * as fs from 'fs';

const GithubColors = require('github-colors');

registerFont(join(__dirname, 'assets', 'Lato-Black.ttf'), { family: 'Lato-Bold', style: 'bold', weight: 'bold' });
registerFont(join(__dirname, 'assets', 'Lato-Regular.ttf'), { family: 'Lato', style: 'normal', weight: 'normal' });

const app = express();

const cutText = (ctx, text: string, width: number) => {
  text = text.split('\n')[0];
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
    const { id } = req.body.head_commit;

    const data = await axios({
      method: 'GET',
      url: `https://api.github.com/repos/${process.env.owner}/${process.env.repository}/commits/${id}`,
      headers: {
        'Authorization': `token ${process.env.token}`
      }
    })
      .then(res => res.data)
      .catch(err => console.error(err));

    if (!data) return;

    const { commit, author, stats, files } = data;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, 1000, 500);

    ctx.fillStyle = '#586069';
    ctx.font = '25px Lato';
    ctx.fillText(req.body.repository.full_name, 70, 70);

    ctx.font = '15px Lato';
    ctx.fillText('on branch', 72, 70 + 18);

    ctx.fillStyle = '#47494c';
    ctx.font = '15px Lato-Bold';
    ctx.fillText(req.body.ref, 72 + ctx.measureText('on branch').width - 5, 70 + 18);

    ctx.fillStyle = '#2f363d';
    ctx.font = 'bold 40px Lato-Bold';

    const lines = cutText(ctx, commit.message, 630);
    lines.forEach((line, index) => {
      ctx.fillText(line, 70, 140 + (index * 50));
    });

    const img = await loadImage(join(__dirname, 'assets', 'changed-file-icon.png'));
    ctx.drawImage(img, 70, 500 - 20 - 90 - 75, 24, 28);

    ctx.font = '25px Lato';
    const linesChangedString = `${stats.total} ${stats.total === 1 ? 'Line' : 'Lines'} changed`;
    const linesChangedWidth = ctx.measureText(linesChangedString).width;

    ctx.font = '25px Lato-Bold';
    const linesAddedString = `+${stats.additions}`;
    const linesAddedWidth = ctx.measureText(linesAddedString).width;

    const linesRemovedString = `-${stats.deletions}`;
    const linesRemovedWidth = ctx.measureText(linesRemovedString).width;

    ctx.fillStyle = '#6e7681';
    ctx.font = '25px Lato';
    ctx.fillText(linesChangedString, 70 + 24 + 10, 500 - 20 - 90 - 75 + 25);

    ctx.fillStyle = '#22863a';
    ctx.font = '25px Lato-Bold';
    ctx.fillText(linesAddedString, 70 + 24 + 10 + linesChangedWidth + 15, 500 - 20 - 90 - 75 + 25);

    ctx.fillStyle = '#cb2431';
    ctx.fillText(linesRemovedString, 70 + 24 + 10 + linesChangedWidth + 15 + linesAddedWidth + 15, 500 - 20 - 90 - 75 + 25);

    let additionPercentage = Math.round(stats.additions / stats.total * 100);
    const percentageStartX = 70 + 24 + 10 + linesChangedWidth + 15 + linesAddedWidth + 15 + linesRemovedWidth + 15;
    const percentageStartY = 500 - 20 - 90 - 75 + 25 - 20;

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

    const profilePicture = await loadImage(author.avatar_url);
    ctx.drawImage(roundImage(profilePicture, profilePicture.width), 70, 500 - 20 - 90, 50, 50);
    ctx.drawImage(roundImage(profilePicture, profilePicture.width), 1000 - 20 - 150, 50, 120, 120);

    ctx.fillStyle = 'black';
    ctx.font = '25px Lato-Bold';

    const username = author.login;
    const usernameWidth = ctx.measureText(username).width;

    ctx.fillText(username, 70 + 50 + 15, 500 - 20 - 90 + 25 + 10);

    const date = new Date(commit.author.date);
    const dateString = `${date.toLocaleString('en-us', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
    const dateStringWidth = ctx.measureText(dateString).width;

    ctx.fillStyle = '#586069';
    ctx.font = '25px Lato';
    ctx.fillText(`committed on ${dateString}`, 70 + 50 + 15 + usernameWidth + 10, 500 - 20 - 90 + 25 + 10);

    ctx.fillStyle = '#47494c';
    ctx.font = '25px Lato';

    const commitId = commit.tree.sha.substring(0, 7);

    ctx.fillText(commitId, 1000 - 50 - ctx.measureText(commitId).width, 500 - 20 - 90 + 25 + 10);

    const languageLines = files.reduce((acc, file) => {
      const language = file.filename.split('.').pop();
      if (language) {
        if (!acc[language]) acc[language] = 0;
        acc[language] += file.changes;
      }
      return acc;
    }, {});

    const languagePercentages = Object.keys(languageLines).reduce((acc, language) => {
      acc[language] = Math.round(languageLines[language] / stats.total * 100);
      return acc;
    }, {});

    for (let language in languagePercentages) {
      const width = 1000 * languagePercentages[language] / 100;
      ctx.fillStyle = GithubColors.ext(language).color;
      ctx.fillRect(0, 480, width, 20);
    }

    fs.writeFileSync(join(__dirname, 'test.png'), canvas.toBuffer());
  }

  res
    .status(200)
    .send('OK')
    .end();
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});