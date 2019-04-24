precision highp float;

//uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 vertPosition;
attribute vec3 position;
attribute vec3 color;
attribute float age;
attribute float alpha;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vColor = color;
    vAlpha = alpha;

    gl_Position = projectionMatrix * vec4( position, 1.0);
}
