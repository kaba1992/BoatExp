uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D renderTexture;
uniform sampler2D revealNoise;

const float N = 2.0;
varying vec2 vUv;

float gridTexture(in vec2 p) {
    vec2 i = step(fract(p), vec2(1.0 / N));
    return 1.0 - i.x - i.y + 2.0 * i.x * i.y;
}

#define mask_tile 0.3

void main() {
    vec2 uv = vUv;
    vec4 clrA = texture2D(renderTexture, uv);
    vec4 clrBG = 0.6 * vec4(1., 1., 1., 1.) * gridTexture(vUv * vec2(5., 5.)) + 0.6;

    float t = (sin(uTime) + 1.) / 2.;

    float edge_width_start = 0.15;
    float edge_width_end = 0.05;
    float edge_width = mix(edge_width_start, edge_width_end, smoothstep(0., 1., 1. - t));
    float myAlpha = mix(0. - edge_width, 1., 1. - t);

    vec2 uv_mask = vUv;
    vec4 alphaTex = texture2D(revealNoise, uv_mask);
    float a = step(alphaTex.r, myAlpha);
    
// float a = 0.5;

    float edge = smoothstep(alphaTex.r - edge_width, alphaTex.r, myAlpha);

    vec4 edgeColor = vec4(0., 0.1, 1.0, 1.0);
    edgeColor *= edge * mask_tile;
    clrA += edgeColor;

    gl_FragColor = mix(clrA, clrBG, a);

}