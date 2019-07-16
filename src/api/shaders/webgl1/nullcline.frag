precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_texture_dim;
uniform vec4 u_color_x;
uniform vec4 u_color_y;
uniform bool u_enable_x;
uniform bool u_enable_y;
uniform float u_threshold;

void main() {
    vec2 uv = gl_FragCoord.xy / u_texture_dim;
    vec4 val = texture2D(u_texture, uv);
    if(u_enable_x && abs(val.x) < u_threshold) {
        gl_FragColor = u_color_x;
    } else if(u_enable_y && abs(val.y) < u_threshold) {
        gl_FragColor = u_color_y;
    } else {
//        gl_FragColor = vec4(0);
    }
}
