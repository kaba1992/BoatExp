uniform samplerCube specMap;

varying vec3 vNormal;
varying vec3 vPosition;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

void main() {
  vec3 modelColour = vec3(0.81, 0.67, 0.67);
  vec3 lighting = vec3(0.0);

  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition); 

  // **Réduction de la lumière ambiante**
  vec3 ambient = vec3(0.05); 

  // **Lumière hémisphérique plus douce**
  vec3 skyColour = vec3(0.0, 0.5, 1.0);
  vec3 groundColour = vec3(1.0, 0.89, 0.81);
  vec3 hemi = mix(groundColour, skyColour, remap(normal.y, -1.0, 1.0, 0.0, 1.0)) * 0.6;

  // **Lumière principale directionnelle**
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  vec3 lightColour = vec3(1.0, 1.0, 0.9);
  float dp = max(0.0, dot(lightDir, normal));

  // **Ombrage toon plus contrasté**
  dp = smoothstep(0.3, 0.55, dp); // Moins de zones claires

  vec3 diffuse = dp * lightColour;

  // **Spéculaire plus discret**
  vec3 r = normalize(reflect(-lightDir, normal));
  float phongValue = max(0.0, dot(viewDir, r));
  phongValue = pow(phongValue, 32.0); 

  float fresnel = 1.0 - max(0.0, dot(viewDir, normal));
  fresnel = pow(fresnel, 2.0);
  fresnel = step(0.7, fresnel);

  vec3 specular = smoothstep(0.4, 0.45, vec3(phongValue)) * 0.2; // Moins lumineux

  lighting = hemi * (fresnel + 0.2) + diffuse * 0.6 + ambient;

 
  vec3 colour = modelColour * lighting;

  gl_FragColor = vec4(pow(colour, vec3(1.0 / 2.2)), 1.0);
}
