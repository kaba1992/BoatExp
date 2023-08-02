
import Experience from "../../Experience"
import * as THREE from "three"
import { MeshBasicMaterial, Vector3, SRGBColorSpace, TextureLoader, Mesh, BackSide, InstancedMesh, Matrix4, LinearSRGBColorSpace } from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { gsap } from "gsap";

export default class Islands {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.renderTexture = this.experience.renderer.renderTexture
        // this.time = this.experience.time
        this.resource = this.resources.items.miniIslandModel
        this.boat = params.boat
        this.setMiniIsland()
        this.setReveal()


    }

    setReveal() {
        const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position =  vec4(position, 1.0);
}
`;

        const fragmentShader = `
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D renderTexture;
uniform sampler2D revealNoise;

const float N = 2.0;
varying vec2 vUv;

float gridTexture(in vec2 p) {
    vec2 i = step(fract(p), vec2(1.0 / N));
    return 1.0 - i.x - i.y + 2.0 * i.x * i.y;
}

#define mask_tile 0.3

void main() {
    vec2 uv = vUv;
    vec4 clrA = texture2D(renderTexture, uv );
    vec4 clrBG = 0.6 * vec4(1., 1., 1., 1.) * gridTexture(vUv * vec2(5., 5.)) + 0.6;

    float t =  (sin(uTime) + 1.) / 2.;

    float edge_width_start = 0.15;
    float edge_width_end = 0.05;
    float edge_width = mix(edge_width_start, edge_width_end, smoothstep(0., 1., 1.-t));
    float myAlpha = mix(0. - edge_width, 1., 1.- t);

    vec2 uv_mask = vUv;
    vec4 alphaTex = texture2D(revealNoise, uv_mask );
    float a = step(alphaTex.r, myAlpha);
    float edge = smoothstep(alphaTex.r - edge_width, alphaTex.r, myAlpha);

    vec4 edgeColor = vec4(0., 0.1, 1.0, 1.0);
    edgeColor *= edge  * mask_tile;
    clrA += edgeColor;

    gl_FragColor = mix(clrA, clrBG, a);
    // gl_FragColor = vec4(clrA.rgb, a);
}
`;
        const loader = new THREE.TextureLoader();
        const revealTexture = loader.load('textures/reveal.png')
        const uniforms = {
            uTime: { value: -2 },
            uResolution: { value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
            renderTexture: { value: this.renderTexture.texture },
            revealNoise: { value: revealTexture }
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            
        });
        // this.material = new THREE.MeshBasicMaterial({ map: this.renderTexture.texture });
        // console.log(this.renderTexture);

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(mesh);
        const gsapTimeline = gsap.timeline()
        gsapTimeline.to(this.material.uniforms.uTime, {
            duration: 4,
            value: 1,
            delay: 0.5
        })
        gsapTimeline.eventCallback("onComplete", function() {
            mesh.visible = false
        })

    }



    setMiniIsland() {
        const textureLoader = new TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/baked.jpg')
        miniIslandTexture.colorSpace = SRGBColorSpace
        miniIslandTexture.flipY = false
        const miniIslandMaterial = new MeshBasicMaterial({ map: miniIslandTexture })
        this.miniIsland = this.resource.scene
        let islandGeometry;


        this.miniIsland.traverse((child) => {
            if (child.isMesh) {

                child.material = miniIslandMaterial

                islandGeometry = child.geometry

            }
        })
        this.miniIsland.scale.set(1.5, 1.5, 1.5)

        this.miniIsland.position.set(0, -0.1, 0)


        for (let i = 0; i < 25; i++) {
            const miniIslandClone = new Mesh(islandGeometry, miniIslandMaterial);
            miniIslandClone.position.set(Math.random() * 125 - 75, 0.5, Math.random() * 125 - 75);
            this.scene.add(miniIslandClone)

        }

        // clone 50 * island with thre.instancedMesh

        // const instanceCount = 25;
        // const miniIslandMesh = this.miniIsland.children.find(child => child.isMesh);
        // const instancedMiniIsland = new InstancedMesh(miniIslandMesh.geometry, miniIslandMaterial, instanceCount);
        // const matrix = new Matrix4();

        // for (let i = 0; i < instanceCount; i++) {
        //     matrix.makeTranslation(Math.random() * 125 - 75,0.5, Math.random() * 125 - 75);
        //     instancedMiniIsland.setMatrixAt(i, matrix);
        // }

        // this.scene.add(instancedMiniIsland);
        // this.scene.add(this.miniIsland)


    }

    update(deltaTime) {
        // this.composer.render()
        // this.revealShader.uniforms.revealThreshold.value += deltaTime * 0.01;
        // this.material.uniforms.uTime.value = deltaTime * 0.5;
    }
}