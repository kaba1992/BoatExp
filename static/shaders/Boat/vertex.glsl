uniform vec2 uFrequency;
uniform float uTime;
uniform vec3 lightPosition;

varying vec2 vUv;

varying float nDotL;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    vec3 lightDirection = normalize(lightPosition - modelPosition.xyz);

    vec3 transformedNormal = normalize(normalMatrix * normal);

    nDotL = max(dot(lightDirection, transformedNormal), 0.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vUv = uv;
}