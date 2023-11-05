import { ConfigProvider } from "@zxtool/react-utils"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./bootstrap"
import "./index.scss"
import { router } from "./router"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConfigProvider>
    <RouterProvider router={router}></RouterProvider>
  </ConfigProvider>,
)
