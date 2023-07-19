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
    //50. for 2500 plane
    vNoiseUv = uv * _SurfaceNoise_ST.xy * 12.;
    vDistortUv = vUv * _SurfaceDistortion_St.xy * 12.;
                #include <begin_vertex>
                #include <project_vertex>
                #include <fog_vertex>

}