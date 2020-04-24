import { getCanvasElement, getWebGL2Context, createShader, createProgram, createVertexBuffer, bindAttributeToVertexBuffer, createIndexBuffer } from "./utils/gl-utils.js"
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./utils/shaders.js"
import { mat4, glMatrix, mat3 } from './utils/gl-matrix/index.js'

// #️⃣ Configuración base de WebGL

const canvas = getCanvasElement('canvas')
const gl = getWebGL2Context(canvas)

gl.clearColor(0, 0, 0, 1)

// #️⃣ Creamos los shaders, el programa que vamos a usar, y guardamos info de sus inputs (atributos y uniforms)

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode)
const program = createProgram(gl, vertexShader, fragmentShader)

const vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition')
const modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')

// #️⃣ Definimos la info de la geometría que vamos a dibujar

const vertexPositions = [
  -0.3, -0.5, // 0
  -0.1, -0.5, // 1
  -0.1, -0.1, // 2
  0.3, -0.1,  // 3
  0.3, 0.1,   // 4
  -0.1, 0.1,  // 5
  -0.1, 0.3,  // 6
  0.3, 0.3,   // 7
  0.3, 0.5,   // 8
  -0.1, 0.5,  // 9
  -0.3, 0.5,  // 10
]

const indices = [
  0, 9, 10, 0, 1, 9,
  2, 3, 4, 2, 4, 5,
  6, 7, 8, 6, 8, 9
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

// #️⃣ Creamos las matrices que vamos a estar usando y valores que vamos a usar para inicializarlas

const translationMatrix = mat4.create()
const scaleMatrix = mat4.create()
const rotationMatrix = mat4.create()
const modelMatrix = mat4.create()

let translation = 0
let scale = 1
let rotation = 0

const transformations = [
  rotationMatrix,
  scaleMatrix,
  translationMatrix,
]

// #️⃣ Establecemos el programa a usar, sus conexiónes atributo-buffer e indices a usar (guardado en el VAO)

gl.useProgram(program)
gl.bindVertexArray(vertexArray)

// #️⃣ Dibujamos la escena

/* 📝
 * Ahora, en vez de directamente llamar a las funciones gl.clear y gl.draw para limpiar/dibujar
 * la escena, lo vamos a hacer dentro de la función render(). Esta función va a ser la encargada de
 * actualizar el valor del uniform correspondiente a la modelMatrix, limpiar el canvas y dibujar
 * nuestra geometría. Observen que después de definirla, la estamos llamando una vez, para que ni
 * bien abrimos la página se dibuje el primer "frame" de nuestra escena. Después, los sliders van a
 * ser los encargados de volver a llamarla y actualizar la escena ante cada cambio an alguno de sus
 * valores.
 */

function render() {
  // Actualizamos matrices de traslación, escalado y rotación
  mat4.fromTranslation(translationMatrix, [translation, 0, 0])
  mat4.fromScaling(scaleMatrix, [scale, scale, scale]);
  mat4.fromRotation(rotationMatrix, glMatrix.toRadian(rotation), [0, 0, 1])

  // "Reseteamos" la modelMatrix y le aplicamos las matrices
  mat4.identity(modelMatrix)
  mat4.multiply(modelMatrix, transformations[0], modelMatrix)
  mat4.multiply(modelMatrix, transformations[1], modelMatrix)
  mat4.multiply(modelMatrix, transformations[2], modelMatrix)

  // Actualizamos el valor del uniform correspondiente a la modelMatrix
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix)

  // Limpiamos el canvas y dibujamos
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

// Nuestro primer frame
render()

// #region 🎛 Configuración de los sliders

// Obtenemos referencia a los sliders
const translationSlider = document.getElementById('translation-slider')
const scaleSlider = document.getElementById('scale-slider')
const rotationSlider = document.getElementById('rotation-slider')

// Obtenemos referencia al texto que los acompaña (que indica el valor actual de cada transformación)
const translationText = document.getElementById('translation-value')
const scaleText = document.getElementById('scale-value')
const rotationText = document.getElementById('rotation-value')

// Esta función facilita actualizar esos textos
function updateText(element, value) {
  element.innerText = value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

// Actualizamos el texto y volvemos a dibujar la escena ante cada cambio en alguno de los sliders
translationSlider.addEventListener('input', (event) => {
  translation = event.target.valueAsNumber
  updateText(translationText, translation)
  render()
})
scaleSlider.addEventListener('input', (event) => {
  scale = event.target.valueAsNumber
  updateText(scaleText, scale)
  render()
})
rotationSlider.addEventListener('input', (event) => {
  rotation = event.target.valueAsNumber
  updateText(rotationText, rotation)
  render()
})

// Seteamos la posición inicial de los sliders a partir de los valores por defecto que definimos
translationSlider.value = translation
scaleSlider.value = scale
rotationSlider.value = rotation

// Lo mismo para el texto que los acompaña
updateText(translationText, translation)
updateText(scaleText, scale)
updateText(rotationText, rotation)

// #endregion

