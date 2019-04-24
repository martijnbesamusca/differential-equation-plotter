precision highp float;

attribute vec2 a_vert_pos;
attribute vec2 a_glob_pos;
attribute vec2 a_dx;
attribute vec2 a_dy;

uniform mat4 u_camera;
uniform mat4 u_screen;

void main() {
    vec4 glob_pos = u_camera * vec4(a_glob_pos, 0.0, 1.0);
    vec4 vert_pos = u_screen * vec4(a_vert_pos, 0.0, 1.0);

    vec2 distance = abs(a_dx + a_dy);
    vec2 rotation = abs(a_dx + a_dy);

    gl_Position = vec4(glob_pos.xy + vert_pos.xy, 0.0, 1.0);
}
