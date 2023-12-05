import { WorkerHelper } from "@zxtool/utils"

function work() {
  onmessage = ({ data: { key, message } }) => {
    postMessage({ key, result: `result is ${message}` })
  }
}

const workerHelper = new WorkerHelper(work)

workerHelper.postMessage("hello world").then(console.log)
