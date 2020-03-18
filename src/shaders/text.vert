in vec2 a_positions;
in vec2 a_offset;
in int a_letter;
in int a_width;

out int v_letter;

uniform vec2 resolution;
uniform sampler2D atlas;
uniform int height;

void main() {
    vec2 pos = (vec2(a_width, height) * a_positions / 2 + a_offset) / resolution;
    gl_Position = vec4(pos, 0, 1);
    v_letter = a_letter;
}
/*
positions: {data: square, numComponents: 2},
offset: {data: offset, numComponents: 2, divisor: 1},
letter: {data: letter, numComponents: 1, divisor: 1},
width: {data: width, numComponents: 1, divisor: 1}
*/
