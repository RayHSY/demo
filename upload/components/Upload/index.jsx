import React from 'react';
import request from '../../utils/request';
import styles from './index.module.css';

export default function Upload(props) {
  const { chunkSize = 10 * 1024 * 1024, multiple = false } = props;
  const [uploadFiles, setUploadFiles] = React.useState([]);

  function handleFileChange(e) {
    const files = e?.target?.files;
    if (files) {
      setUploadFiles(files);
    } else {
      alert('无法识别文件')
    }
  }

  async function handleUpload(e) {
    if (uploadFiles.length === 0) return;
    const fileChunkList = createFileListChunk(uploadFiles, chunkSize);
    uploadChunks(fileChunkList);
  }

  function createFileChunk(file, chunkSize) {
    const fileChunkList = [];
    let curSize = 0;
    for (let i = 0; curSize <= file.size; i++) {
      fileChunkList.push({
        data: file.slice(curSize, curSize + chunkSize),
        hash: `${file.name}_${i}`,
        name: file.name,
        count: Math.ceil(file.size / chunkSize),
      })
      curSize += chunkSize;
    }
    return fileChunkList;
  }

  function createFileListChunk(fileList, chunkSize) {
    let fileListChunks = [];
    Array.prototype.forEach.call(fileList, file => {
      fileListChunks = fileListChunks.concat(createFileChunk(file, chunkSize));
    });

    return fileListChunks;
  }

  async function uploadChunks(chunks) {
    const requestList = chunks.map(chunk => {
      const formData = new FormData();
      formData.append('chunk', chunk.data);
      formData.append('hash', chunk.hash);
      formData.append('filename', chunk.name);
      formData.append('count', chunk.count);

      return formData;
    }).map(async (formData) => {
      request({
        url: '/api/uploadChunkFile',
        data: formData,
      })
    })

    await Promise.all(requestList);
  }

  return <div className={styles.uploadWrapper}>
    <input multiple={multiple} className={styles.uploadInput} type="file" onChange={handleFileChange}/>
    <span className={styles.btn} onClick={handleUpload}>Upload</span>
  </div>
}