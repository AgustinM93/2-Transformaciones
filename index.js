import { getCanvasElement, getWebGL2Context, createShader, createProgram, createVertexBuffer, bindAttributeToVertexBuffer, createIndexBuffer } from "./utils/gl-utils.js"
import { vertexShaderSourceCode, fragmentShaderSourceCode } from "./utils/shaders.js"

// #️⃣ Configuración base de WebGL

// Encontramos el canvas y obtenemos su contexto de WebGL
const canvas = getCanvasElement('canvas')
const gl = getWebGL2Context(canvas)

// Seteamos el color que vamos a usar para 'limpiar' el canvas (i.e. el color de fondo)
gl.clearColor(0, 0, 0, 1)

// #️⃣ Creamos los shaders, el programa que vamos a usar, y guardamos info de sus atributos

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode)

const program = createProgram(gl, vertexShader, fragmentShader)

const vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition')

// #️⃣ Definimos la info de la geometría que vamos a dibujar (un cuadrado)

const vertexPositions = [
  -0.5, -0.5, // 0 👈 indice de cada posición
  0.5, -0.5,  // 1
  0.5, 0.5,   // 2
  -0.5, 0.5   // 3
]

const indices = [
  // primer triangulo
  0, 1, 3,
  // segundo triangulo
  3, 1, 2
]

/* 📝 Ya no hay posiciones de vertices repetidas! 🎉 Definimos cada uno de los 4 vertices una sola
 * vez, y mediante indices, decimos cuales son los que usa cada triangulo.
 */

// #️⃣ Guardamos la info del cuadrado (i.e. la posición de sus vértices e indices) en VBOs e Index Buffer Objects (IBOs)

const vertexPositionsBuffer = createVertexBuffer(gl, vertexPositions)
const indexBuffer = createIndexBuffer(gl, indices)

/* 📝 Desde el punto de vista de su almacenamiento, un buffer de indices no tiene nada de particular
 * respecto a los buffers que veníamos usando (para las posiciones o los colores), es otro segmento
 * de memoria con datos, que en este caso se limitan a ser de tipo entero. De hecho, si miran las
 * implementaciones de createVertexBuffer y createIndexBuffer van a ver que son casi idénticas. La
 * diferencia se ve en cómo se obtiene la información de cada vértice a la hora de dibujarlos. Mas
 * detalle en breve.
 */

// #️⃣ Asociamos los atributos del programa a los buffers creados, y establecemos el buffer de indices a usar

// Creamos un Vertex Array Object (VAO)
const vertexArray = gl.createVertexArray()

// A partir de aca, el VAO registra cada atributo habilitado y su conexión con un buffer, junto con los indices
gl.bindVertexArray(vertexArray)

// Habilitamos cada atributo y lo conectamos a su buffer
gl.enableVertexAttribArray(vertexPositionLocation)
bindAttributeToVertexBuffer(gl, vertexPositionLocation, 2, vertexPositionsBuffer)

// Conectamos el buffer de indices que vamos a usar
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

// Dejamos de tomar nota en el VAO
gl.bindVertexArray(null)

// #️⃣ Establecemos el programa a usar, sus conexiónes atributo-buffer e indices a usar (guardado en el VAO)

gl.useProgram(program)
gl.bindVertexArray(vertexArray)

// #️⃣ Dibujamos la escena (nuestro majestuoso cuadrado)

// Limpiamos el canvas
gl.clear(gl.COLOR_BUFFER_BIT)

// Y dibujamos 🎨
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

/* 📝 Para usar los indices del indexBuffer, pasamos de usar gl.drawArrays(...) a usar
 * gl.drawElements(...). Con drawArrays, lo que veníamos haciendo, era leer directamente del buffer
 * vertexPositionsBuffer la posición de cada uno de los vértice de los triángulos, de forma
 * secuencial. Las primeras tres para el primer triangulo, las otras tres para el segundo
 * (repitiendo posiciones si hacia falta). Ahora, estamos agregando un nivel de indirección a las
 * posiciones, un "alias" para cada una, por medio de indices. A la hora de obtener info para un
 * vértice, primero se mira el buffer de indices, y con el indice que encontramos, vamos al
 * buffer de posiciones.
 */
