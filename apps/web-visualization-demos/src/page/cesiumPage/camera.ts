import { ViewerHelper } from "@zxtool/cesium-utils"
import GUI from "lil-gui"

export const initCameraGUI = () => {
  const viewer = ViewerHelper.getViewer()!
  const camera = viewer.camera
  const gui = new GUI()

  const params = { heading: camera.heading, pitch: camera.pitch, roll: camera.roll }

  // gui.add(params, "heading", -Math.PI * 2, Math.PI * 2, 0.01).onChange((v: number) => {
  //   camera.setView({
  //     destination: camera.position,
  //     orientation: { heading: v },
  //   })
  // })
  // gui.add(params, "pitch", -Math.PI * 2, Math.PI * 2, 0.01).onChange((v: number) => {
  //   camera.setView({
  //     destination: camera.position,
  //     orientation: { pitch: v },
  //   })
  // })
  gui.add(params, "roll", -Math.PI * 2, Math.PI * 2, 0.01).onChange((v: number) => {
    camera.setView({
      destination: camera.position,
      orientation: { roll: v },
    })
  })

  // setInterval(() => {
  //   console.log(camera.heading, camera.pitch, camera.roll)
  //   camera.setView({
  //     destination: camera.position,
  //     orientation: { pitch: camera.pitch + 0.01 },
  //   })
  // }, 1000)
}
