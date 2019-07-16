precision highp float;

uniform sampler2D u_texture;

void main() {
//    gl_FragColor = texture2D(u_texture, vec2(1.0, 0.0));
    gl_FragColor = vec4(1.0, 0.0, 0.0, .5);
}
