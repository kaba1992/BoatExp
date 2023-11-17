import Experience from "../../Experience"
import * as THREE from "three"
import { gsap } from "gsap";
import { Sine } from "gsap/all";
import revealVertex from "./../../../../static/shaders/Boat/revealVertex.glsl"
import revealFragment from "./../../../../static/shaders/Boat/revealFragment.glsl"

export default class Reveal {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.renderTexture = this.experience.renderer.renderTexture

 
        this.addListeners()

    }



    setReveal() {
        this.revealTexture = this.resources.items.revealTexture
console.log(this.revealTexture);
        const loader = new THREE.TextureLoader();
        const revealTexture = this.revealTexture;
        const uniforms = {
            uTime: { value: -1 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            renderTexture: { value: this.renderTexture.texture },
            revealNoise: { value: revealTexture }
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: revealVertex,
            fragmentShader: revealFragment,
            uniforms,

        });
       

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        // change mesh render order to render after the boat
        // mesh.renderOrder = -10
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

    addListeners() {
        window.addEventListener('resourcesReady', () => {
            this.setReveal()
        })
    }
}