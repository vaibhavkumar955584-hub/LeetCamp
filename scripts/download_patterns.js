const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../data/patterns');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const fileList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/patterns_file_list.json'), 'utf8'));

function downloadFile(id, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDir, filename);
    const url = `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;

    function get(u) {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
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
      }).on('error', reject);
    }

    get(url);
  });
}

async function run() {
  console.log('Downloading all 48 pattern CSVs...');
  const entries = Object.entries(fileList);
  for (let i = 0; i < entries.length; i++) {
    const [filename, id] = entries[i];
    try {
      await downloadFile(id, filename);
      console.log(`[${i + 1}/${entries.length}] Downloaded ${filename}`);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err.message);
    }
  }
  console.log('Finished download process!');
}

run();
