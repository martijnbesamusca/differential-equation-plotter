precision highp float;

attribute vec2 a_vert_pos;
attribute vec2 a_glob_pos;
attribute vec3 a_color;
attribute float a_alpha;
attribute float a_dx;
attribute float a_dy;

uniform mat4 u_camera;
uniform mat4 u_screen;

varying vec3 v_color;
varying float v_alpha;

void main() {
    float width = 2.0 / u_screen[0][0] + 2.0 / u_camera[0][0];
    float height = 2.0 / u_screen[1][1] + 2.0 / u_camera[1][1];
    vec2 direction = vec2(a_dx, a_dy);
    vec2 distance = abs(direction);
    float rotation = atan(direction.x * width, direction.y * height);
    mat2 rot_mat = mat2(
        cos(rotation), -sin(rotation),
        sin(rotation), cos(rotation)
    );

    vec4 glob_pos = u_camera * vec4(a_glob_pos, 0.0, 1.0);
    vec4 vert_pos = u_screen * vec4(rot_mat * a_vert_pos, 0.0, 1.0);

    v_color = a_color;
    v_alpha = a_alpha;

    gl_Position = vec4(glob_pos.xy + vert_pos.xy, a_alpha-1.0, 1.0);
}
