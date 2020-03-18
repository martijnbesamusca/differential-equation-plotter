#version 300 es
#define red vec4(1., 0., 0, 1.)
#define blue vec4(0., 0., 1., 1.)
#define gray vec4(0., 0., 0., .5)
#define black vec4(0., 0., 0., 1.)

precision mediump float;

uniform vec2 resolution; // width, height
uniform vec4 window; // min_x, max_x, min_y, max_y

flat in uint v_type;

out vec4 o_color;
vec4 colors[8] = vec4[8](red, black, gray, gray, blue, black, gray, gray);

void main() {
    highp vec2 pos = gl_FragCoord.xy;

    o_color = colors[v_type];
}
