import { MathUtils, Matrix4, Vector3 } from "@zxtool/three-math"

export const multiplyMats = (...mats: Matrix4[]) => {
  const mat = new Matrix4()
  mats.forEach(item => mat.multiply(item))
  return mat
}

const addLineOrder = (source: string) => {
  return source
    .split("\n")
    .map((l, i) => `${i + 1}: ${l}`)
    .join("\n")
}

export const createProgram = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!

  gl.shaderSource(vertexShader, vs)
  gl.shaderSource(fragmentShader, fs)

  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(`${gl.getShaderInfoLog(vertexShader)}\n${addLineOrder(vs)}`)
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(`${gl.getShaderInfoLog(fragmentShader)}\n${addLineOrder(fs)}`)
  }

  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
  }

  return program
}

export const getOrthographicMat = (l: number, r: number, t: number, b: number, n: number, f: number, scale = 1) => {
  return multiplyMats(
    new Matrix4().makeScale((2 * scale) / (r - l), (2 * scale) / (t - b), 2 / (n - f)),
    new Matrix4().makeTranslation((l + r) * -0.5, (b + t) * -0.5, (n + f) * 0.5),
  )
}

export const getOrthographicMat_ = (l: number, r: number, t: number, b: number, n: number, f: number) => {
  return multiplyMats(
    new Matrix4().makeScale(2 / (r - l), 2 / (t - b), 2 / (n - f)),
    new Matrix4().makeTranslation((l + r) * -0.5, (b + t) * -0.5, (n + f) * 0.5),
  )
}

export const getPerspectiveMat = (fov: number, aspect: number, near: number, far: number, scale = 1) => {
  const [n, f] = [near, far]
  const halfFov = MathUtils.degToRad(fov) * 0.5
  const t = (near * Math.tan(halfFov)) / scale
  const height = t * 2
  const width = aspect * height

  const _mat = new Matrix4().set(n, 0, 0, 0, 0, n, 0, 0, 0, 0, n + f, n * f, 0, 0, -1, 0)
  const orthographicMat = getOrthographicMat(width * -0.5, width * 0.5, t, -t, n, f)
  return multiplyMats(orthographicMat, _mat)
}

export const _getPerspectiveMat = (fov: number, aspect: number, near: number, far: number) => {
  const [n, f] = [near, far]
  const halfFov = MathUtils.degToRad(fov) * 0.5
  const t = near * Math.tan(halfFov)
  const height = t * 2
  const width = aspect * height

  const _mat = new Matrix4().set(n, 0, 0, 0, 0, n, 0, 0, 0, 0, n + f, n * f, 0, 0, -1, 0)
  const orthographicMat = getOrthographicMat(width * -0.5, width * 0.5, t, -t, n, f)
  return multiplyMats(orthographicMat, _mat)
}

export const lookAt = (eye: Vector3, target: Vector3, up: Vector3) => {
  const zAxis = new Vector3().subVectors(eye, target).normalize()
  if (zAxis.clone().cross(up).length() === 0) {
    if (Math.abs(up.z) === 1) zAxis.x += 1e-4
    else zAxis.z += 1e-4
    zAxis.normalize()
  }
  const xAxis = new Vector3().crossVectors(up, zAxis).normalize()
  const yAxis = new Vector3().crossVectors(zAxis, xAxis).normalize()

  // prettier-ignore
  const moveMat = new Matrix4().set(
    1, 0, 0, eye.x, 
    0, 1, 0, eye.y, 
    0, 0, 1, eye.z, 
    0, 0, 0, 1
  )
  // prettier-ignore
  const rotateMat = new Matrix4().set(
    xAxis.x,yAxis.x,zAxis.x,0,
    xAxis.y,yAxis.y,zAxis.y,0,
    xAxis.z,yAxis.z,zAxis.z,0,
    0,0,0,1
  )

  return multiplyMats(moveMat, rotateMat)
}
