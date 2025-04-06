import Experience from "../../Experience"
import * as THREE from "three"
import { gsap } from "gsap";
import { Sine } from "gsap/all";
import revealVertex from "./../../../../static/shaders/Boat/revealVertex.glsl"
import revealFragment from "./../../../../static/shaders/Boat/revealFragment.glsl"
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';


export default class Reveal {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera.instance
        this.renderer = this.experience.renderer.instance
       
        this.material = null
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        this.renderTexture = null;


        this.addListeners()

    }



    setReveal() {
        this.revealTexture = this.resources.items.revealTexture

        const loader = new THREE.TextureLoader();
        const revealTexture = this.revealTexture;
        const uniforms = {

        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: revealVertex,
            fragmentShader: revealFragment,
            uniforms: {
                uTime: { value: -1 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                renderTexture: { value: null },
                revealNoise: { value: revealTexture }
            },
        });
        const revealPlane = new THREE.PlaneGeometry(2, 2, 1, 1);



        const mesh = new THREE.Mesh(revealPlane, this.material);
        mesh.frustumCulled = false;
        // change mesh render order to render after the boat
        mesh.renderOrder = 999
        // mesh.visible = false
        this.scene.add(mesh);
        const gsapTimeline = gsap.timeline()
        const self = this

        gsapTimeline.to(this.material.uniforms.uTime, {
            duration: 3,
            value: 1,
            // delay: 0.5,
            ease: Sine.easeIn,
        })
        const revealEndEvent = new Event('revealEnd')
        gsapTimeline.eventCallback("onComplete", function () {
            self.material.dispose()
            self.material = null
            self.scene.remove(mesh)
            window.dispatchEvent(revealEndEvent)
        })

    }


    addListeners() {
        window.addEventListener('resourcesReady', () => {
            this.setReveal()
        })

        window.addEventListener('startExp', () => {


        })
    }

    update() {
        this.renderTexture = this.experience.renderer.renderTexture
        if (this.material) {
            this.material.uniforms.renderTexture.value = this.renderTexture.texture
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.scene, this.camera)
        }


        if (this.experience.renderer.outlineEffect) {
            this.experience.renderer.outlineEffect.render(this.scene, this.camera);
        }
        // this.composer.render()

    }
}