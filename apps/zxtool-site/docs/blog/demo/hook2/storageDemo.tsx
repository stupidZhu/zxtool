import { StorageUtil } from "@zxtool/utils"
import { useEffect } from "react"
const storageUtil = new StorageUtil("ZX")

const StorageDemo = () => {
  useEffect(() => {
    window.addEventListener("storage", e => {
      console.log(e)
    })
  }, [])
  return (
    <div>
      <button
        onClick={() => {
          storageUtil.setItem("HELLO", { hello: "world" })
        }}
      >
        change
      </button>
    </div>
  )
}

export default StorageDemo
