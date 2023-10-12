import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "src/page/App"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="app" /> },
  { path: "/app", element: <App /> },
])
