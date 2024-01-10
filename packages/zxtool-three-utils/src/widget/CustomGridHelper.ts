import * as THREE from "three"

export interface CustomGridHelperProps {
  xSize?: number
  xCount?: number
  ySize?: number
  yCount?: number
  lineColor?: THREE.ColorRepresentation
  centerLineColor?: THREE.ColorRepresentation
}

export class CustomGridHelper extends THREE.LineSegments {
  type = "CustomGridHelper"

  constructor(props: CustomGridHelperProps = {}) {
    const { xSize = 1, xCount = 10, ySize = 1, yCount = 10, lineColor = 0x888888, centerLineColor = 0x444444 } = props

    const lineColorArray = new THREE.Color(lineColor).toArray()
    const centerLineColorArray = new THREE.Color(centerLineColor).toArray()

    const xHalf = (xCount * xSize) / 2
    const yHalf = (yCount * ySize) / 2

    const vertices: number[] = []
    const colors: number[] = []

    for (let x = -xHalf; x <= xHalf; x += xSize) {
      vertices.push(x, 0, -yHalf, x, 0, yHalf)
      const colorArr = x === 0 ? centerLineColorArray : lineColorArray
      colors.push(...colorArr, ...colorArr)
    }
    for (let y = -yHalf; y <= yHalf; y += ySize) {
      vertices.push(-xHalf, 0, y, xHalf, 0, y)
      const colorArr = y === 0 ? centerLineColorArray : lineColorArray
      colors.push(...colorArr, ...colorArr)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false })

    super(geometry, material)
  }

  dispose() {
    this.geometry.dispose()
    // @ts-ignore
    this.material.dispose()
  }
}

new CustomGridHelper({})
