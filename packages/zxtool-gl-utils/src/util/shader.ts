const handleSource = (string: string, errorLine: number) => {
  const lines = string.split("\n")
  const lines2 = []
  const from = Math.max(errorLine - 6, 0)
  const to = Math.min(errorLine + 6, lines.length)
  for (let i = from; i < to; i++) {
    const line = i + 1
    lines2.push(`${line === errorLine ? ">" : " "} ${line}: ${lines[i]}`)
  }
  return lines2.join("\n")
}

const getShaderCompileErrInfo = (gl: WebGL2RenderingContext, shader: WebGLShader, type: "vertex" | "fragment") => {
  const errors = gl.getShaderInfoLog(shader)!.trim()
  const errorMatches = /ERROR: 0:(\d+)/.exec(errors)

  if (!errorMatches) return errors

  const errorLine = parseInt(errorMatches[1])
  return type.toUpperCase() + "\n\n" + errors + "\n\n" + handleSource(gl.getShaderSource(shader)!, errorLine)
}

export const createProgram = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!

  gl.shaderSource(vertexShader, vs)
  gl.shaderSource(fragmentShader, fs)

  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(getShaderCompileErrInfo(gl, vertexShader, "vertex"))
  }
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(getShaderCompileErrInfo(gl, fragmentShader, "fragment"))
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
