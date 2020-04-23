export const vertexShaderSourceCode = `#version 300 es

  uniform mat4 modelMatrix;

  in vec2 vertexPosition;
  out vec3 color;

  void main() {
    color = vec3(vertexPosition, 1);
    gl_Position = modelMatrix * vec4(vertexPosition, 0, 1);
  }
`

export const fragmentShaderSourceCode = `#version 300 es
  precision mediump float;

  in vec3 color;
  out vec4 fragmentColor;

  void main() {
    fragmentColor = vec4(color, 1);
  }
`