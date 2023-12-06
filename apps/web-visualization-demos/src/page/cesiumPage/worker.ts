import { WorkerFn, WorkerHelper } from "@zxtool/utils"

const work: WorkerFn<string> = getWorkerUtil => {
  onmessage = e => {
    const { getMsg, postMsg, throwError } = getWorkerUtil(e)
    const message = getMsg()
    if (message === "hello 2") throwError(`error is ${message}`)
    else postMsg(`result is ${message}`)
  }
}

const workerHelper = new WorkerHelper(work)

workerHelper
  .postMessage<string>("hello 1")
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })
workerHelper.postMessage("hello 2").then(console.log).catch(console.error)
workerHelper.postMessage("hello 3").then(console.log).catch(console.error)
setTimeout(() => {
  workerHelper.terminate()
  workerHelper.postMessage("hello 4").then(console.log).catch(console.error)
}, 1000)
