import { createBrowserRouter, Navigate } from "react-router-dom"
import CesiumPage from "src/page/cesiumPage/CesiumPage"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="cesiumPage" /> },
  { path: "/cesiumPage", element: <CesiumPage /> },
])
