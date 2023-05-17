uniform sampler2D uTexture;
uniform float uTime;
vec3 lightColor = vec3(1.0, 1.0, 1.0);
uniform vec3 uColor;
varying vec2 vUv;
varying float nDotL;

float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * (3.0 - 2.0 * f);

    return mix(mix(Hash(i + vec2(0., 0.)), Hash(i + vec2(1., 0.)), f.x), mix(Hash(i + vec2(0., 1.)), Hash(i + vec2(1., 1.)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.) * .5;
    v += noise(p * 2.) * .25;
    v += noise(p * 4.) * .125;
    return v;
}

void main() {
    
    vec2 uv = vUv;
    vec4 src = texture2D(uTexture, uv);

    vec4 col = src;

   

  
    vec3 diffuseColor = lightColor * nDotL * 3.5;

    uv.x -= 1.5;

    float ctime = mod(uTime * 0.25, 2.5);
   // burn
    float d = uv.x + uv.y * .5 + .5 * fbm(uv * 15.1) + ctime * 1.3;
    if(d > .35)
        col = clamp(col - vec4((d - .35) * 10.), vec4(0.0), vec4(1.0));
    if(d > .47) {
        if(d < .5)
            col += vec4((d - .4) * 33.0 * .5 * (0.0 + noise(100. * uv + vec2(-ctime * 2., 0.))) * vec3(1.5, 0.5, 0.0), 0.0) ;

    }

    gl_FragColor = col * vec4(diffuseColor, 1.0);
}