import { createBrowserRouter, Navigate } from "react-router-dom"
import CesiumPage from "src/page/cesiumPage/CesiumPage"
import ThreePage from "src/page/threePage/ThreePage"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="cesiumPage" /> },
  { path: "/cesiumPage", element: <CesiumPage /> },
  { path: "/threePage", element: <ThreePage /> },
])
