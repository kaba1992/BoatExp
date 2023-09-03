
import Experience from "../../Experience"
import * as THREE from "three"
import { gsap } from "gsap";
//import Sine gsap plugin
import { Sine } from "gsap/all";

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
        this.miniIslands = []
        this.setMiniIslands()
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
        this.scene.add(mesh);
        const gsapTimeline = gsap.timeline()
        gsapTimeline.to(this.material.uniforms.uTime, {
            duration: 3,
            value: 1,
            delay: 0.5,
            ease: Sine.easeIn, y: -500

        })
        gsapTimeline.eventCallback("onComplete", function () {
            mesh.visible = false
        })

    }



    setMiniIslands() {
        const textureLoader = new THREE.TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/bakedNew.jpg')
        miniIslandTexture.colorSpace = THREE.SRGBColorSpace
        miniIslandTexture.flipY = false
        this.miniIsland = this.resource.scene
        const miniIslandMaterial = new THREE.MeshBasicMaterial({ map: miniIslandTexture })
        const originalMiniIslandMesh = this.miniIsland.children.find(child => child.isMesh);
        console.log(this.miniIsland);
        let positions = [];
        let overlap = true;
        let minimaleDistance = 20;
        let tailleZoneExclue = 20;
        let minScale = 1;

        for (let i = 0; i < 25; i++) {
            const miniIslandClone = originalMiniIslandMesh.geometry.clone();

            while (overlap) {
                overlap = false;
                let x = Math.random() * 125 - 75;
                let z = Math.random() * 125 - 75;

                if (Math.abs(x) < tailleZoneExclue / 2 && Math.abs(z) < tailleZoneExclue / 2) {
                    overlap = true;
                    continue;
                }

                for (let pos of positions) {
                    let dx = pos.x - x;
                    let dz = pos.z - z;
                    let distance = Math.sqrt(dx * dx + dz * dz);
                    if (distance < minimaleDistance) {
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    let scale = Math.random() * (3 - minScale) + minScale;
                    let y = scale < 1.5 ? 0.5 : 0.8;

                    const miniIslandMesh = new THREE.Mesh(miniIslandClone, miniIslandMaterial);
                    miniIslandMesh.position.set(x, y, z);
                    miniIslandMesh.scale.set(scale, scale, scale);
                    miniIslandMesh.rotation.y = Math.random() * Math.PI * 2;
                    this.miniIslands.push(miniIslandMesh);

                    this.scene.add(miniIslandMesh);

                    positions.push({ x: x, z: z });
                }
            }
            overlap = true;
        }
    }

    update(deltaTime) {

    }
}