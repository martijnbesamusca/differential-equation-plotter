precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_texture_dim;
uniform vec3 u_color_x;
uniform vec3 u_color_y;
uniform bool u_enable_x;
uniform bool u_enable_y;
uniform float u_threshold;

void main() {
    vec2 uv = gl_FragCoord.xy / u_texture_dim;
//    vec2 pixel = vec2(1, 1) / u_texture_dim;
//    vec4 val = texture2D(u_texture, uv);

    vec4 up = texture2D(u_texture, uv + vec2(0, -u_threshold));
    vec4 down = texture2D(u_texture, uv + vec2(0, u_threshold));
    vec4 left = texture2D(u_texture, uv + vec2(-u_threshold, 0));
    vec4 right = texture2D(u_texture, uv + vec2(u_threshold, 0));
    vec4 middle = texture2D(u_texture, uv);

    float alphaX = 0.0;
    float alphaY = 0.0;

    if(u_enable_x) {
        float flipVertical = sign(up.x * down.x); // if 0 or -1 yes, 1 no
        flipVertical = floor((flipVertical + 1.0) / 2.0); // 0 yes, 1 no

        float flipHorizontal = sign(left.x * right.x); // if 0 or -1 yes, 1 no
        flipHorizontal = floor((flipHorizontal + 1.0) / 2.0); // 0 yes, 1 no

        alphaX = 1.0 - flipVertical * flipHorizontal;
    }

    if(u_enable_y) {
        float flipVertical = sign(up.y * down.y); // if 0 or -1 yes, 1 no
        flipVertical = floor((flipVertical + 1.0) / 2.0); // 0 yes, 1 no

        float flipHorizontal = sign(left.y * right.y); // if 0 or -1 yes, 1 no
        flipHorizontal = floor((flipHorizontal + 1.0) / 2.0); // 0 yes, 1 no

        alphaY = 1.0 - flipVertical * flipHorizontal;
    }

    vec3 color = alphaX * u_color_x + alphaY * u_color_y;
    if (alphaX + alphaY != 0.0) {
        color /= alphaX + alphaY;
    }

    gl_FragColor = vec4(color, ceil((alphaX+alphaY)/2.0));



//        float alpha = pow(1.0 - abs(val.x) / u_threshold, 2.0);
//        alpha = 1.0;
//        gl_FragColor = vec4(u_color_x,alpha);



//    } else if(u_enable_y && abs(val.y) < u_threshold) {
//        float alpha = pow(1.0 - abs(val.y) / u_threshold, 2.0);
//        alpha = 1.0;
//        gl_FragColor = vec4(u_color_y, alpha);
//    }
}
