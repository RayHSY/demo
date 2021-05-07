const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class PromiseSelf {
  constructor(cb) {
    this.state = PENDING;
    this.value = null;
    this.reason = null;
    this.fulfilledQueue = [];
    this.rejectedQueue = [];

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.value = value;
        this.state = FULFILLED;

        if (this.fulfilledQueue.length > 0) {
          const fulfilled = this.fulfilledQueue.shift();
          fulfilled(value);
        }
      }
    }

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.reason = reason
        this.state = REJECTED;

        if (this.rejectedQueue.length > 0) {
          const rejected = this.rejectedQueue.shift();
          rejected(value);
        }
      }
    }

    try {
      cb(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === FULFILLED) {
      onFulfilled(this.value);
    } else if (this.state === REJECTED) {
      onRejected(this.reason);
    } else {
      this.fulfilledQueue.push(onFulfilled);
      if (onRejected) {
        this.rejectedQueue.push(onRejected);
      }
    }
  }
}

// test 

const p = new PromiseSelf((resolve, reject) => {
  resolve('success');
  // setTimeout(() => {
  //   resolve('success');
  // }, 1000);
})

p.then((v) => {
  console.log(v);
}, (error) => {
  console.log(error);
})