# Promise/A+ 规范

`promise`是一个有then方法的对象或函数，行为遵循本规范
`thenable`是一个有then方法的对象或者函数
`value`是`promise`成功状态时的值，包括`undefined`/`thenable`或者`promise`
`exception`是一个使用throw抛出的异常值
`reason`是`promise`失败状态时的值

## Promise States

Promise必须处于以下三个状态之一：`pending`，`fulfilled`或者`rejected`

* 如果在pending状态，可以变成fulfilled或者rejected
* 如果在fulfilled状态，不会变成其它值，必须有一个value值
* 如果在rejected状态，不会变成其它值，必须有一个reason值

## then方法

promise必须提供一个then方法，来访问最终结果

promise的then方法接收两个参数
```js
promise.then(onFulfilled, onRejected)
```

* onFulfilled和onRejected是可选参数，但必须是函数类型
* onFulfilled
  * 必须在promise变成fulfilled状态时，调用onFulfilled，参数是promise的value
  * promise不是fulfilled状态时，无法调用
  * 只能被调用一次
* onRejected
  * 必须在promise变成rejected状态时，调用onRejected，参数是promise的reason
  * promise不是rejected状态时，无法调用
  * 只能被调用一次
* onFulfilled和onRejected应该是微任务
* onFulfilled和onRejected必须作为函数被调用
* then方法可能被多次调用
  * 如果promise变成了 fulfilled态，所有的onFulfilled回调都需要按照then的顺序执行
  * 如果promise变成了 rejected态，所有的onRejected回调都需要按照then的顺序执行
* then必须返回一个promise
  ```js
  promise2 = promise1.then(onFulfilled, onRejected);
  ```
  * onFulfilled 或 onRejected 执行的结果为x,调用 resolvePromise
  * 如果 onFulfilled 或者 onRejected 执行时抛出异常e,promise2需要被reject
  * 如果 onFulfilled 不是一个函数，promise2 以promise1的value fulfilled
  * 如果 onRejected 不是一个函数，promise2 以promise1的reason rejected

## resolvePromise

```js
resolvePromise(promise2, x, resolve, reject)
```

* 如果 promise2 和 x 相等，那么 reject promise with a TypeError
* 如果 x 是一个 promise
  * 如果x是pending态，那么promise必须要在pending,直到 x 变成 fulfilled or rejected.
  * 如果 x 被 fulfilled, fulfill promise with the same value.
  * 如果 x 被 rejected, reject promise with the same reason.
* 如果 x 是一个 object 或者 是一个 function
  1. let then = x.then
  2. 如果 x.then 这步出错，那么 reject promise with e as the reason..
  3. 如果 then 是一个函数，then.call(x, resolvePromiseFn, rejectPromiseFn)
    * resolvePromiseFn 的 入参是 y, 执行 resolvePromise(promise2, y, resolve, reject);
    * rejectPromise 的 入参是 r, reject promise with r.
    * 如果 resolvePromise 和 rejectPromise 都调用了，那么第一个调用优先，后面的调用忽略。
    * 如果调用then抛出异常e 
      * 如果 resolvePromise 或 rejectPromise 已经被调用，那么忽略
      * 否则，reject promise with e as the reason
  4. 如果 then 不是一个function. fulfill promise with x.
* 如果 x 不是一个 object 或者 function，fulfill promise with x.


## Promise的其它方法

* Promise.resolve()
* Promise.reject()
* Promise.prototype.catch()
* Promise.prototype.finally()
* Promise.all()
* Promise.race()

### Promise.resolve

> Promise.resolve(value) 返回一个以给定值解析后的Promise 对象.

1. 如果 value 是个 thenable 对象，返回的promise会“跟随”这个thenable的对象，采用它的最终状态
2. 如果传入的value本身就是promise对象，那么Promise.resolve将不做任何修改、原封不动地返回这个promise对象。
3. 其他情况，直接返回以该值为成功状态的promise对象。