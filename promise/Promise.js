const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class Promise {
  constructor(executor) {
    this.state = PENDING;
    this.value = null;
    this.reason = null;
    this.fulfilledQueue = [];
    this.rejectedQueue = [];

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.value = value;
        this.state = FULFILLED;
        this.fulfilledQueue.map(fn => fn());
      }
    }

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.reason = reason
        this.state = REJECTED;
        this.rejectedQueue.map(fn => fn());
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  static resolve(value) {
    if (value instanceof Promise) return value;
    return new Promise((resolve, reject) => {
      if (value && value.then && typeof value.then === 'function') {
        setTimeout(() => {
          value.then(resolve, reject);
        })
      } else {
        resolve(value);
      }
    })
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    })
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      const result = [];
      let iteratorIndex = 0;
      let fullCount;

      for (const promise of promises) {
        const resultIndex = iteratorIndex++;

        Promise.resolve(promise).then(res => {
          result[resultIndex] = res;
          fullCount++;

          if (fullCount === iteratorIndex) {
            resolve(result);
          }
        }).catch(err => {
          reject(err);
        })
      }

      if (iteratorIndex === 0) {
        resolve([]);
      }
    })
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (const promise of promises) {
        Promise.resolve(promise).then((value) => {
          return resolve(value);
        }, err => {
          return reject(err);
        })
      }
    })
  }

  then(onFulfilled, onRejected) {

    const self = this;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    let promise2 = new Promise((resolve, reject) => {
      if (self.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err);
          }
        });
      } else if (self.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err);
          }
        });
      } else {
        self.fulfilledQueue.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(self.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (err) {
              reject(err);
            }
          });
        });
        if (onRejected) {
          self.rejectedQueue.push(() => {
            setTimeout(() => {
              try {
                const x = onRejected(self.reason)
                resolvePromise(promise2, x, resolve, reject)
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      }
  
    })

    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(value => {
      return Promise.resolve(callback()).then(() => value);
    }, err => {
      return Promise.resolve(callback()).then(() => {throw err});
    })
  }

  static defer() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    })
    return dfd;
  }

  static deferred() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    })
    return dfd;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle'));
  }
  if (x && typeof x === 'object' || typeof x === 'function') {
    let used = false;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (used) return;
          used = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (used) return;
          used = true;
          reject(r);
        });
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (err) {
      if (used) return;
      used = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}

module.exports = Promise;