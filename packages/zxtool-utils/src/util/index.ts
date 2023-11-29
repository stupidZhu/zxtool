import { curry } from "lodash"

export const genInfo = curry((mainModule: string, subModule: string, info: string) => {
  return `[${mainModule} - ${subModule}] ${info}`
})

export const genZUInfo = genInfo("@zxtool/utils")
