import { IObj } from "@zxtool/utils/dist/type"
import { useEffect, useRef } from "react"

const useWhyDidYouRender = (key: React.Key, props: IObj) => {
  const prevProps = useRef(props)

  useEffect(() => {
    const changedProps: IObj = {}
    Object.entries(props).forEach(([k, v]) => {
      const prev = prevProps.current[k]
      if (v !== prev) changedProps[k] = { current: v, prev }
    })
    Object.keys(changedProps).length && console.log(key, "---", changedProps)
    prevProps.current = props
  })
}

export default useWhyDidYouRender
