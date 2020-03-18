#version 300 es

precision mediump float;

in vec2 a_position;
in uint a_type;

uniform vec2 resolution;
uniform vec4 window;
uniform int num_x;
uniform int num_y;
uniform vec4 tick_lim;

flat out uint v_type;


vec3 widths = vec3(2.0, 1.0, 0.8);

vec2 get_line_v() {
    vec2 pos = a_position;
    pos.x /= resolution.x;
    pos.x *= widths[a_type & uint(3)];
    return pos;
}

vec2 get_line_h() {
    vec2 pos = a_position;
    pos.y /= resolution.y;
    pos.y *= widths[a_type & uint(3)];
    return pos;
}

float get_offset_v() {
    float window_width = window[1] - window[0];
    float window_height = window[3] - window[2];

    float view_width = tick_lim[1] - tick_lim[0];
    float spacing = view_width / float(num_x);
    float offset = tick_lim[0] + spacing * float(gl_InstanceID);
    offset = (offset - window[0]) / window_width * 2.;
    offset -= 1.;
    return offset;
}

float get_offset_h() {
    float window_width = window[1] - window[0];
    float window_height = window[3] - window[2];

    float view_height = tick_lim[3] - tick_lim[2];
    float spacing = view_height / float(num_y);
    float offset = tick_lim[2] + spacing * float(gl_InstanceID - num_x);
    offset = (offset - window[2]) / window_height * 2.;
    offset -= 1.;
    return offset;
}

void main() {
    bool axis = a_type < uint(4);
//    float offset = get_offset();
    vec2 pos;
    if(axis) {
        pos = get_line_v();
        pos.x += get_offset_v();
    } else {
        pos = get_line_h();
        pos.y += get_offset_h();
    }
    gl_Position = vec4(pos, 0, 1);
    v_type = a_type;
}
