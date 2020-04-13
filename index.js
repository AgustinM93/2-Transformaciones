import { getCanvasElement, getWebGL2Context, createShader, createProgram, createVertexBuffer, bindAttributeToVertexBuffer, createIndexBuffer } from "./utils/gl-utils.js"
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./utils/shaders.js"

// #️⃣ Configuración base de WebGL

const canvas = getCanvasElement('canvas')
const gl = getWebGL2Context(canvas)

gl.clearColor(0, 0, 0, 1)

// #️⃣ Creamos los shaders, el programa que vamos a usar, y guardamos info de sus atributos

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode)
const program = createProgram(gl, vertexShader, fragmentShader)

const vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition')

// #️⃣ Definimos la info de la geometría que vamos a dibujar

const vertexPositions = [
  -0.5, -0.5, // 0 👈 indice de cada posición
  0.5, -0.5,  // 1
  0.5, 0.5,   // 2
  -0.5, 0.5   // 3
]

const indices = [
  0, 1, 3,
  3, 1, 2
]

// #️⃣ Guardamos la info de la geometría en VBOs e IBO

const vertexPositionsBuffer = createVertexBuffer(gl, vertexPositions)
const indexBuffer = createIndexBuffer(gl, indices)

// #️⃣ Asociamos los atributos del programa a los buffers creados, y establecemos el buffer de indices a usar

const vertexArray = gl.createVertexArray()
gl.bindVertexArray(vertexArray)
gl.enableVertexAttribArray(vertexPositionLocation)
bindAttributeToVertexBuffer(gl, vertexPositionLocation, 2, vertexPositionsBuffer)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bindVertexArray(null)

// #️⃣ Establecemos el programa a usar, sus conexiónes atributo-buffer e indices a usar (guardado en el VAO)

gl.useProgram(program)
gl.bindVertexArray(vertexArray)

// #️⃣ Dibujamos la escena

gl.clear(gl.COLOR_BUFFER_BIT)
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)



