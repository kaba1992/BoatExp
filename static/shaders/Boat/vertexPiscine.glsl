 #include <fog_pars_vertex>


 uniform vec4 _SurfaceNoise_ST;
 uniform vec4 _SurfaceDistortion_St;

varying vec2 vUv;
varying vec3 vNormal;
varying vec2 vNoiseUv;
varying vec2 vDistortUv;
void main() {

    vUv = uv;
    vNormal = normal;
    vNoiseUv = uv * _SurfaceNoise_ST.xy + _SurfaceNoise_ST.zw;
    vDistortUv = vUv * _SurfaceDistortion_St.xy + _SurfaceDistortion_St.zw;
                #include <begin_vertex>
                #include <project_vertex>
                #include <fog_vertex>

}