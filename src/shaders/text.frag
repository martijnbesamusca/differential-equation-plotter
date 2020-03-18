precision mediump float;

uniform vec2 resolution;
uniform sampler2D atlas;
uniform int height;

in int v_letter;

out vec4 o_color;

void main() {
    o_color = vec4(0, 0, v_letter / 20., 1);
}
