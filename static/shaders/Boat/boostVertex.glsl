varying vec2 vUv;

void main() {

    gl_Position = vec4(vec3(position.x + 0.6, position.y -0.8, position.z), 1.0);
    //   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
}