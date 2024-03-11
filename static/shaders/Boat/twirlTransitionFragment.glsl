uniform sampler2D uTexture;
uniform float uEffectRadius;
varying vec2 vUv;
#define PI 3.14159

void main() {
    vec2 center = vec2(0.5, 0.5);
    float effectAngle = 2. * PI;
    vec2 coords = vUv - center;
    float distance = length(coords);
    float angle = atan(coords.y, coords.x) + effectAngle * smoothstep(uEffectRadius, 0.0, distance);
    if(distance < uEffectRadius) {
        float percent = (uEffectRadius - distance) / uEffectRadius;
        float theta = percent * percent * angle;
        float s = sin(theta);
        float c = cos(theta);
        coords = vec2(dot(coords, vec2(c, -s)), dot(coords, vec2(s, c)));
    }
    coords += center;
    gl_FragColor = texture2D(uTexture, coords);
}