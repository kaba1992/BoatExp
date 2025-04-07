uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAlphaTexture;
uniform sampler2D uOutlineTexture;
uniform float uRevealRatio;
uniform float uOpacity;
varying vec2 vUv;

float hash1(float n) {
    return fract(sin(n) * 43758.5453);
}
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// The parameter w controls the smoothness
float voronoi(in vec2 x, float w, float offset) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for(int j = -2; j <= 2; j++) for(int i = -2; i <= 2; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash2(n + g);

        // animate
            o = offset + 0.3 * sin(uTime + 6.2831 * o + x);

        // distance to cell        
            float d = length(g - f + o);

        // do the smooth min for colors and distances        
            float h = smoothstep(-1.0, 1.0, (m - d) / w);
            m = mix(m, d, h) - h * (1.0 - h) * w / (1.0 + 3.0 * w); // distance
        }

    return m;
}

void main() {
    vec2 uv = (vUv * uResolution * 2.0 - uResolution) / uResolution.y; // normalize the canvas from -1 to 1 & the center 0,0 in the middle of canvas
    vec4 color = vec4(0.0);

    uv.y /= uResolution.x / uResolution.y;
    vec2 uvStatic = uv;
// Moves the canvas diagonally
    uv.x += uTime * .5;
    uv.y += uTime * .25;

    // Color palette
    vec4 a = vec4(0.114, 0.635, 0.847, 1.0);
    vec4 b = vec4(1.000, 1.000, 1.000, 1.0);
    vec4 c = a * 0.8; // darkens the a color

    // First Top Voronoi Noise
    float vNoise = voronoi(uv, 0.001, 0.5);
    float sNoise = voronoi(uv, 0.1, 0.5);
    float fVoronoi = smoothstep(0.0, 0.01, vNoise - sNoise);

    // Second Offset Voronoi Noise
    float vNoise2 = voronoi(uv, 0.001, 0.3);
    float sNoise2 = voronoi(uv, 0.1, 0.3);
    float offsetVoronoi = smoothstep(0.0, 0.01, vNoise2 - sNoise2);

    // BG Stripes
    float pi = 3.14159265359;
    float wave = sin(pi * (uv.x + uv.y));
    wave = (wave + 1.) / 2.; // to get the output in the range of 0 to 1

    vec4 bgColor = mix(a, c, wave);
    vec4 bgColor2 = mix(a, c, offsetVoronoi + wave);

    float alpha = texture2D(uAlphaTexture, vUv).r;

    // Final Voronoi Noise
    vec4 finalVoronoi = vec4(mix(bgColor2, b, fVoronoi));
    vec4 finalColor = mix(finalVoronoi, vec4(0.0), alpha);
    float edgeWidth = 0.008; // Largeur de l'effet sinusoïdal
    float edgeFreq = 7.0; // Fréquence de l'ondulation
    float edgePos = uRevealRatio;
    float sinEdge = edgePos +
        edgeWidth * sin(edgeFreq * vUv.y * 3.14159 + uTime * 5.) +
        edgeWidth * 0.5 * sin(edgeFreq * 2.0 * vUv.y * 3.14159 - uTime * 5. * 0.7);
    float smoothEdge = smoothstep(sinEdge - 0.01, sinEdge + 0.01, vUv.x);
    finalColor = mix(finalColor, vec4(0.325, 0.807, 0.971, 0.725) * 1. - alpha, smoothEdge);
    vec4 outlineColor = texture2D(uOutlineTexture, vUv );

    gl_FragColor = finalColor;
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, outlineColor.rgb, outlineColor.a);

    gl_FragColor.a *= uOpacity;
}