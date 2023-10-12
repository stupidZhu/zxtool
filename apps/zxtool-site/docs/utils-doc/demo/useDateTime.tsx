/**
 * title: useDateTime
 */

import { useDateTime } from "@zxtool/react-utils"
import React from "react"

const BaseDemo = () => {
  const [time] = useDateTime()
  const [timeArr] = useDateTime({ formatter: ["YYYY-MM-DD", "HH:mm:ss"], interval: 3000 })

  return (
    <>
      {time} <br />
      {`${timeArr[0]} --- ${timeArr[1]}`}
    </>
  )
}

export default BaseDemo
