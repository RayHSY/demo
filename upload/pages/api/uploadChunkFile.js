import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = `${__dirname}/upload_files`;

export default (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable({ multiple: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        return;
      } else {
        const { filename, hash } = fields;
        const { chunk } = files;
        const chunkDir = path.resolve(UPLOAD_DIR, filename);

        fs.stat(chunkDir, (err, stats) => {
          if (err) {
            fs.mkdirSync(chunkDir);
          }
          
        })
        res.status(200).json({ fields, files })
      }
    })
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}