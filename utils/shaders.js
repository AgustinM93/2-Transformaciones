export const vertexShaderSourceCode = `#version 300 es

  uniform mat4 modelMatrix;

  in vec2 vertexPosition;

  void main() {
    gl_Position = modelMatrix * vec4(vertexPosition, 0, 1);
  }
`

export const fragmentShaderSourceCode = `#version 300 es
  precision mediump float;

  out vec4 fragmentColor;

  void main() {
    fragmentColor = vec4(0, 1, 0, 1);
  }
`