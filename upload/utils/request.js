export default function request(params) {
  const { url, method = 'post', data, headers = {}, requestList } = params;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(data);
    xhr.onload = e => {
      resolve({
        data: e?.target?.response,
      })
    }
    xhr.onerror = e => {
      reject(e);
    }
  })
}