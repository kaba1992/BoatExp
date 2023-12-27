        #include <common>
        #include <packing>
        #include <fog_pars_fragment>

uniform sampler2D _SurfaceNoise;
uniform sampler2D _SurfaceDistortion;
uniform float cameraNear;
uniform float cameraFar;
uniform float uTime;
uniform vec2 resolution;

vec4 _DepthGradientShallow = vec4(0.325, 0.807, 0.971, 0.725);
vec4 _DepthGradientDeep = vec4(0.086, 0.407, 1.0, 0.749);
vec3 _FoamColor = vec3(1.0, 1.0, 1.0);
      // blue waterColor
        //vec3 waterColor = vec3(0.0, 0.0, 1.0);

float _DepthMaxDistance = 1.2;
float _FoamDistance = 0.4;
float _FoamMaxDistance = 0.4;
float _FoamMinDistance = 0.04;
float _SurfaceNoiseCutoff = 0.777;
float _SurfaceDistortionAmount = 0.57;
vec2 _SurfaceNoiseScroll = vec2(0.01, 0.01);
vec2 noiseUV;
float SMOOTHSTEP_AA = 0.01;

uniform sampler2D uDepthTexture;
uniform sampler2D uCameraNormalsTexture;

varying vec2 vUv;
varying vec2 vNoiseUv;
varying vec2 vDistortUv;
varying vec4 vScreenPosition;
varying vec3 vNormal;

vec4 alphaBlend(vec4 top, vec4 bottom) {
          // Calcul de la nouvelle couleur
      vec3 color = top.rgb * top.a + bottom.rgb * (1.0 - top.a);

          // Calcul du nouvel alpha
      float alpha = top.a + bottom.a * (1.0 - top.a);

      return vec4(color, alpha);
}

float getDepth(const in vec2 screenPosition) {
                #if DEPTH_PACKING == 1
      return unpackRGBAToDepth(texture2D(uDepthTexture, screenPosition));
                #else
      return texture2D(uDepthTexture, screenPosition).x;
                #endif
}

float getViewZ(const in float depth) {
                #if ORTHOGRAPHIC_CAMERA == 1
      return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
                #else
      return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
                #endif
}

void main() {
          // Ici, vous devrez remplacer "existingDepth01" et "existingDepthLinear" 
          // par leurs équivalents dans votre moteur 3D / bibliothèque.
      vec2 screenUV = gl_FragCoord.xy / resolution;
      float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
      float linearEyeDepth = getViewZ(getDepth(screenUV));

      float depthDifference = saturate(fragmentLinearEyeDepth - linearEyeDepth);
      float waterDepthDifference = saturate(depthDifference / _DepthMaxDistance);
      vec4 waterColor = mix(_DepthGradientShallow, _DepthGradientDeep, waterDepthDifference);

      vec2 distortSample = (texture2D(_SurfaceDistortion, vDistortUv).xy * 2.0 - 1.0) * _SurfaceDistortionAmount;

      noiseUV = vec2((vNoiseUv.x + uTime * _SurfaceNoiseScroll.x) + distortSample.x, (vNoiseUv.y + uTime * _SurfaceNoiseScroll.y) + distortSample.y);
      float surfaceNoiseSample = texture2D(_SurfaceNoise, noiseUV).r;
          //We'd like the waves' intensity to increase near the shoreline or where objects intersect the surface of the water
      float foamDepthDifference = saturate((depthDifference / _FoamDistance));
      float SurfaceNoiseCutoff = foamDepthDifference * _SurfaceNoiseCutoff;
      // float surfaceNoise = surfaceNoiseSample > SurfaceNoiseCutoff ? 1.0 : 0.0;
     float surfaceNoise = smoothstep(SurfaceNoiseCutoff - SMOOTHSTEP_AA, SurfaceNoiseCutoff + SMOOTHSTEP_AA, surfaceNoiseSample);

      
          // waterAnimation 

      waterColor += surfaceNoise;

     
      gl_FragColor.rgb = waterColor.rgb;
      gl_FragColor.a = 1.0;

            #include <tonemapping_fragment>
            // #include <encodings_fragment>
            #include <fog_fragment>
}