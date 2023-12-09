import { createBrowserRouter, Navigate } from "react-router-dom"
import CesiumPage from "src/page/cesiumPage/CesiumPage"
import MultiViewer from "src/page/multiViewer/MultiViewer"
import ThreePage from "src/page/threePage/ThreePage"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="cesiumPage" /> },
  { path: "/cesiumPage", element: <CesiumPage /> },
  { path: "/multiViewer", element: <MultiViewer /> },
  { path: "/threePage", element: <ThreePage /> },
])
