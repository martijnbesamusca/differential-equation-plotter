precision highp float;

varying float v_alpha;

void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, v_alpha);
}
