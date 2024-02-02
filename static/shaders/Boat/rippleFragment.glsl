uniform vec2 uResolution;
uniform float time;
uniform sampler2D uNoiseTexture;
varying vec2 vUv;

void main() {
    // Coordonnées UV modifiées avec le temps pour le scrolling
    vec2 uv = vUv;
    uv = uv + vec2(0.0, time * 0.1);

    // Application de la texture de bruit
    vec4 noise = texture2D(uNoiseTexture, uv);

 
    gl_FragColor = vec4(noise.rgb, noise.a);
}