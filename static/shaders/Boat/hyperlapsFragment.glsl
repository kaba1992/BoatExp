uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;

varying vec2 vUv;

const int nsamples = 10;

// void main() {
//     vec2 suv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
//     vec2 uv = vec2(length(suv), atan(suv.y, suv.x));
// //calcule un décalage basé sur le temps et l'angle
//     float offset = 0.1 * sin(uv.y * 10.0 - uTime * 0.6) * cos(uv.y * 48.0 + uTime * 0.3) * cos(uv.y * 3.7 + uTime);
//    //génère un effet de "rayons" autour du centre de l'écran
//     vec3 rays = vec3(sin(uv.y * 150.0 + uTime) * 0.5 + 0.5) *
//         vec3(sin(uv.y * 80.0 - uTime * 0.6) * 0.5 + 0.5) *
//         vec3(sin(uv.y * 45.0 + uTime * 0.8) * 0.5 + 0.5) *
//         vec3(1.0 - cos(uv.y + 22.0 * uTime - pow(uv.x + offset, 0.3) * 60.0)) *
//         vec3(uv.x * 2.0);
//     vec4 colorRay = vec4(rays.rg * 0.7, rays.b, 1.0);
//     colorRay.a = length(colorRay.rgb) > 0.1 ? 1.0 : 0.0;
//     gl_FragColor = colorRay;
// }

void main() {


    float blurStart = 1.0;
    float blurWidth = 0.02;

    vec2 uv = vUv ;
    float precompute = blurWidth * (1.0 / float(nsamples - 1));

    vec4 color = vec4(0.0);
    for(int i = 0; i < nsamples; i++) {
        float scale = blurStart + (float(i) * precompute);
        color += texture2D(uNoiseTexture, uv * scale );
    }

    color /= float(nsamples);

    gl_FragColor = color;
}