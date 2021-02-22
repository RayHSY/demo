import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = './upload_chunks';
const UPLOAD_FILE_DIR = './upload_files';

export default (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable({ multiple: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.status(200).json({
          message: `上传失败: ${err}`,
          code: 10001,
        })
        return;
      } else {
        const { filename, hash, count } = fields;
        const { chunk } = files;
        const chunkDir = path.resolve(UPLOAD_DIR, filename);

        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR);
        }
        if (!fs.existsSync(chunkDir)) {
          fs.mkdirSync(chunkDir);
        }

        const scripts = fs.readdirSync(chunkDir);

        if (!scripts.includes(hash)) {
          // 如果该切片不存在则保存切片到同名文件夹
          fs.copyFileSync(chunk.path, path.resolve(chunkDir, hash));
          scripts.push(hash);
        }

        res.status(200).json({
          message: '上传成功',
          code: 10000,
        })

        if (scripts.length === Number(count)) {
          if (!fs.existsSync(UPLOAD_FILE_DIR)) {
            fs.mkdirSync(UPLOAD_FILE_DIR);
          }
          const writeStream = fs.createWriteStream(path.resolve(UPLOAD_FILE_DIR, filename));
          mergeChunks(chunkDir, scripts, writeStream);
        }
      }
    })
  }
}

function mergeChunks(targetPath, scripts = [], fileWriteStream) {
  if (!scripts.length) {
    fs.rmdirSync(targetPath);
    return fileWriteStream.end();
  }

  const currentChunk = path.resolve(targetPath, scripts.shift());
  const currentReadStream = fs.createReadStream(currentChunk);

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', () => {
    fs.unlinkSync(currentChunk);
    mergeChunks(targetPath, scripts, fileWriteStream);
  })

  currentReadStream.on('error', (error) => {
    console.error(error);
    fileWriteStream.close();
  })
}

export const config = {
  api: {
    bodyParser: false
  }
}