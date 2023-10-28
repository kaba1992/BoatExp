
import Experience from "../../Experience"
import * as THREE from "three"
import { gsap } from "gsap";
//import Sine gsap plugin
import { Sine } from "gsap/all";
import { log } from "three-nebula";

export default class Island {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.renderTexture = this.experience.renderer.renderTexture
        // this.time = this.experience.time
        this.resource = this.resources.items.miniIslandModel
        this.emptysResource = this.resources.items.emptysModel
        this.bigIslandResource = this.resources.items.volcanoModel
        this.boat = params.boat
        this.miniIslands = []
        this.miniIslandEmpty = []
        this.bigIslands = []
        this.setMiniIslands()
       


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
    // float a = 0.5;

    float edge = smoothstep(alphaTex.r - edge_width, alphaTex.r, myAlpha);

    vec4 edgeColor = vec4(0., 0.1, 1.0, 1.0);
    edgeColor *= edge  * mask_tile;
    clrA += edgeColor;
    
    // vec4(mix(clrA.rgb, clrBG.rgb, a), clrA.a);
    gl_FragColor = mix(clrA, clrBG, a);
    // gl_FragColor = vec4(clrA.rgb, a);
}
`;
        const loader = new THREE.TextureLoader();
        const revealTexture = loader.load('textures/revealTest1.jpg')
        const uniforms = {
            uTime: { value: -1 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
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
       // change mesh render order to render after the boat
        mesh.renderOrder = -10
        this.scene.add(mesh);
        const gsapTimeline = gsap.timeline()
        gsapTimeline.to(this.material.uniforms.uTime, {
            duration: 3,
            value: 1,
            // delay: 0.5,
            ease: Sine.easeIn,
        })
        const revealEndEvent = new Event('revealEnd')
        gsapTimeline.eventCallback("onComplete", function () {
            mesh.visible = false
            window.dispatchEvent(revealEndEvent)
        })

    }



    setMiniIslands() {
        const textureLoader = new THREE.TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/bakedNew.jpg')
        miniIslandTexture.colorSpace = THREE.SRGBColorSpace
        miniIslandTexture.flipY = false
        const miniIslandMaterial = new THREE.MeshBasicMaterial({ map: miniIslandTexture })
        this.miniIsland = this.resource.scene
        this.bigIsland = this.bigIslandResource.scene
        this.emptysParent = this.emptysResource.scene

        this.emptysParent.traverse((child) => {

            this.miniIslandEmpty.push(child)

        });


        const instanceCount = 13;
        const miniIslandMesh = this.miniIsland.children.find(child => child.isMesh);
        const bigIslandMesh = this.bigIsland.children.find(child => child.isMesh);
        let minScale = 3;

        for (let i = 0; i < this.miniIslandEmpty.length; i++) {
            // create 25 island with 1 miniIslandMesh

            console.log(this.miniIslandEmpty[i].name.startsWith('Island'));
            // set the miniIsland position to the miniIslandEmpty position
            if (this.miniIslandEmpty[i].name.startsWith('Island')) {
                const miniIsland = new THREE.Mesh(miniIslandMesh.geometry, miniIslandMaterial);
                this.miniIslands.push(miniIsland)

                miniIsland.position.copy(this.miniIslandEmpty[i].position)
                // get rando float between 1 and 3
                const scale = Math.random() * (6 - minScale) + minScale;

                let y = scale < 1.5 ? 0.8 : 1.3;
                miniIsland.scale.multiplyScalar(scale)
                miniIsland.position.y = y
                this.scene.add(miniIsland)
            }
            if (this.miniIslandEmpty[i].name.startsWith('BigIsland')) {
                const bigIsland = this.bigIsland.clone()
                bigIsland.scale.multiplyScalar(0.2)

                bigIsland.position.copy(this.miniIslandEmpty[i].position)
                bigIsland.position.y = -2.4
                this.miniIslands.push(bigIsland)
                this.scene.add(bigIsland)
            }
        }


    }
    update(deltaTime) {


    }
}
