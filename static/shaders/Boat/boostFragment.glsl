uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash1(float n) {
    return fract(sin(n) * 43758.5453);
}

vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// Fonction Voronoi
float voronoi(vec2 x, float w, float offset) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    
    for (int j = -2; j <= 2; j++)
    for (int i = -2; i <= 2; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        
        // Animation
        o = offset + 0.3 * sin(uTime + 6.2831 * o + x);
        
        // Distance à la cellule
        float d = length(g - f + o);
        
        // Smooth min pour les couleurs et distances
        float h = clamp(0.5 + 0.5 * (m - d) / w, 0.0, 1.0);
        m = mix(m, d, h) - h * (1.0 - h) * w;
    }
    return m;
}

void main() {
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    vec3 color = vec3(0.0);
    
    uv *= 2.0;
    uv.x += uTime * 0.5;
    uv.y += uTime * 0.25;
    
    vec3 a = vec3(0.114, 0.635, 0.847);
    vec3 b = vec3(1.0);
    vec3 c = a * 0.8; // Assombrit la couleur `a`
    
    float vNoise = voronoi(uv, 0.001, 0.5);
    float sNoise = voronoi(uv, 0.4, 0.5);
    float fVoronoi = smoothstep(0.0, 0.01, vNoise - sNoise - 0.055);
    
    float vNoise2 = voronoi(uv, 0.001, 0.3);
    float sNoise2 = voronoi(uv, 0.4, 0.3);
    float offsetVoronoi = smoothstep(0.0, 0.01, vNoise2 - sNoise2 - 0.055);
    
    float pi = 3.14159265359;
    float wave = sin(pi * (uv.x + uv.y));
    wave = (wave + 1.0) / 2.0;
    
    vec3 bgColor = mix(a, c, wave);
    vec3 bgColor2 = mix(a, c, offsetVoronoi + wave);
    
    vec3 finalColor = mix(bgColor2, b, fVoronoi);
    
    gl_FragColor = vec4(finalColor, 1.0);
}