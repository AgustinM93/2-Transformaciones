import { getCanvasElement, getWebGL2Context, createShader, createProgram, createVertexBuffer, bindAttributeToVertexBuffer, createIndexBuffer } from "./utils/gl-utils.js"
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./utils/shaders.js"
import { mat4, glMatrix, mat3 } from './utils/gl-matrix/index.js'

// #️⃣ Configuración base de WebGL

const canvas = getCanvasElement('canvas')
const gl = getWebGL2Context(canvas)

gl.clearColor(0, 0, 0, 1)

// Habilitamos el test de profundidad
gl.enable(gl.DEPTH_TEST)

// #️⃣ Creamos los shaders, el programa que vamos a usar, y guardamos info de sus inputs (atributos y uniforms)

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode)
const program = createProgram(gl, vertexShader, fragmentShader)

const vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition')
const modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')

// #️⃣ Definimos la info de la geometría que vamos a dibujar

const vertexPositions = [
  -0.14,-1.702,5.936,
  -0.14,-1.489,6.031,
  0,-2.115,6.089,
  0.14,-1.702,5.936,
  0,-1.794,6.45,
  -0.14,0.926,0.609,
  -0.14,0.713,0.514,
  0,0.482,3.66,
  0.14,-1.489,6.031,
  0,-2.025,6.347,
  -0.14,0.661,3.74,
  0,1.033,0.103,
  -0.14,1.858,4.274,
  0.14,1.858,4.274,
  0.14,0.713,0.514,
  0,0.55,0.105,
  0,2.115,4.387,
  0,0.802,0,
  0.14,0.661,3.74,
  0.14,0.926,0.609
]

const indices = [
  12 	,10 ,1,
2 ,	3 ,	9,
3, 	18, 	8,
12, 	5, 	10,
6 ,	10, 	5,
0, 	1, 	10,
14, 	15, 	17,
7, 	18, 	3,
15, 	6, 	17,
9, 	4, 	0,
9, 	0, 	2,
15, 	7, 	6,
9, 	3, 	4,
8, 	13, 	16,
7, 	3, 	2,
8, 	4, 	3,
10, 	6, 	7,
5, 	12, 	16,
11, 	19, 	14,
14, 	7, 	15,
0, 	10, 	7,
13, 	8, 	18,
19, 	13, 	18,
16, 	1, 	4,
4, 	8, 	16,
1, 	16, 	12,
18, 	7, 	14,
11, 	17, 	6,
11, 	5, 	16,
16, 	13, 	19,
0, 	7, 	2,
11, 	6, 	5,
1, 	0, 	4,
16, 	19, 	11,
17, 	11, 	14,
18, 	14, 	19
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
let translationY = 0
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
  mat4.fromTranslation(translationMatrix, [translation,translationY, 0])
  mat4.fromScaling(scaleMatrix, [scale, scale, 1]);
  mat4.fromRotation(rotationMatrix, glMatrix.toRadian(rotation), [0, 0, 1])

  // "Reseteamos" la modelMatrix y le aplicamos las matrices
  mat4.identity(modelMatrix)
  mat4.multiply(modelMatrix, transformations[0], modelMatrix)
  mat4.multiply(modelMatrix, transformations[1], modelMatrix)
  mat4.multiply(modelMatrix, transformations[2], modelMatrix)

  // Actualizamos el valor del uniform correspondiente a la modelMatrix
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix)

  // Limpiamos el canvas y dibujamos
  gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

// Nuestro primer frame
render()

// #region 🎛 Configuración de los sliders

// Obtenemos referencia a los sliders
const translationSlider = document.getElementById('translation-slider')
const translationSlider1 = document.getElementById('translation-slider1')
const scaleSlider = document.getElementById('scale-slider')
const rotationSlider = document.getElementById('rotation-slider')

// Obtenemos referencia al texto que los acompaña (que indica el valor actual de cada transformación)
const translationText = document.getElementById('translation-value')
const translationText1 = document.getElementById('translation-value1')
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
translationSlider1.addEventListener('input', (event) => {
  translationY = event.target.valueAsNumber
  updateText(translationText1, translationY)
  render()
})

translationSlider
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
translationSlider1.value = translationY
scaleSlider.value = scale
rotationSlider.value = rotation

// Lo mismo para el texto que los acompaña
updateText(translationText, translation)
updateText(translationText1, translationY)
updateText(scaleText, scale)
updateText(rotationText, rotation)

// #endregion

