import chalk from "chalk"
import { curry } from "lodash"

export type MsgType = "error" | "warn" | "info" | "success"
const msgColorMap = { error: "red", warn: "yellow", info: "blue", success: "green" }

const genMsg = curry((mainModule: string, subModule: string, info: string, type: MsgType | undefined) => {
  let moduleInfo = `[${mainModule} - ${subModule}]`
  if (type) moduleInfo = chalk[msgColorMap[type]](moduleInfo)
  return `${moduleInfo} ${info}`
})

export const genZGUMsg = genMsg("@zxtool/gl-utils")
