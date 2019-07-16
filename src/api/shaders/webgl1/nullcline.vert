precision highp float;

attribute vec2 a_position;

void main() {
//    v_color = a_color;

    gl_Position = vec4(a_position, 0.0, 1.0);
}
