const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../data/patterns');
const fileList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/patterns_file_list.json'), 'utf8'));

function downloadFile(id, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDir, filename);
    const url = `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;

    function get(u, retries = 5) {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location, retries);
          return;
        }
        if (res.statusCode !== 200) {
          if (retries > 0) {
            console.log(`Retrying ${filename} after HTTP ${res.statusCode} (attempts left: ${retries})`);
            setTimeout(() => get(u, retries - 1), 1500);
            return;
          }
          reject(new Error(`Failed to download ${filename}: HTTP ${res.statusCode}`));
          return;
        }
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filePath);
        });
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        if (retries > 0) {
          setTimeout(() => get(u, retries - 1), 1500);
        } else {
          reject(err);
        }
      });
    }

    get(url);
  });
}

async function verifyAndDownloadMissing() {
  const missing = [];
  for (const [filename, id] of Object.entries(fileList)) {
    const filePath = path.join(targetDir, filename);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 10) {
      missing.push({ filename, id });
    }
  }

  console.log(`Missing or invalid files: ${missing.length}`);
  for (const item of missing) {
    console.log(`Downloading missing: ${item.filename}`);
    await downloadFile(item.id, item.filename);
    console.log(`Successfully downloaded: ${item.filename}`);
  }

  const allFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.csv'));
  console.log(`Total pattern CSV files present now: ${allFiles.length} / 48`);
}

verifyAndDownloadMissing();
