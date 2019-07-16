precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_texture_dim;
uniform vec4 u_color_x;
uniform vec4 u_color_y;
uniform float u_threshold;

void main() {
    vec2 uv = gl_FragCoord.xy / u_texture_dim;
    vec4 val = texture2D(u_texture, uv);
    if(abs(val.r) < u_threshold) {
        gl_FragColor = u_color_x;
    } else if(abs(val.g) < u_threshold) {
        gl_FragColor = u_color_y;
    } else {
//        gl_FragColor = vec4(0);
    }
}
