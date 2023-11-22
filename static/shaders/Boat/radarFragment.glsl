uniform float iTime;
uniform vec2 iResolution;

varying vec2 vUv;

#define green vec3(0.0, 1.0, 0.0)

vec3 RadarPing(in vec2 uv, in vec2 center, in float innerTail, 
               in float frontierBorder, in float timeResetSeconds, 
               in float radarPingSpeed, in float fadeDistance) {
    vec2 diff = center - uv;
    float r = length(diff);
    float time = mod(iTime, timeResetSeconds) * radarPingSpeed;

    float circle = 0.0;
    circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder, time, r);
    circle *= smoothstep(fadeDistance, 0.0, r);

    return vec3(circle);
}

void main() {
    vec2 uv = vUv;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    vec3 color = vec3(0.0);
    float fadeDistance = 1.0;
    float resetTimeSec = 4.0;
    float radarPingSpeed = 0.3;
    vec2 greenPing = vec2(0.0, 0.0);
    color += RadarPing(uv, greenPing, 0.25, 0.025, resetTimeSec, radarPingSpeed, fadeDistance) * green;

    gl_FragColor = vec4(l, 1.0);
}