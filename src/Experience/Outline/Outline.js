import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import Experience from "../Experience.js";
import { CustomOutlinePass } from "./CustomOutlinePass.js";
import FindSurfaces from "./FindSurfaces";



export default class Outline {

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.renderer = this.experience.renderer.instance
        this.sizes = this.experience.sizes
        this.surfaceFinder = new FindSurfaces();
        this.setRenderPass()
        this.renderTarget = this.createRenderTarget(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio);
    }
    // Create a render target that holds a depthTexture so we can use it in the outline pass
    createRenderTarget(width, height) {
        const target = new THREE.WebGLRenderTarget(width, height);
        const depthTexture = new THREE.DepthTexture();

        target.depthTexture = depthTexture;
        target.depthBuffer = true;
        return target;
    }
    // Initial render pass.
    setRenderPass() {
        this.composer = new EffectComposer(this.renderer, this.renderTarget);
        this.pass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.pass);

        // Outline pass
        this.CustomOutline = new CustomOutlinePass(
            new THREE.Vector2(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio),
            this.scene,
            this.camera
        );
        this.composer.addPass(this.CustomOutline);

        // Anti-aliasing pass
        this.effectFXAA = new ShaderPass(FXAAShader);
        this.effectFXAA.uniforms["resolution"].value.set(
            1 / (this.sizes.width * this.sizes.pixelRatio),
            1 / (this.sizes.height * this.sizes.pixelRatio)
        );
        this.composer.addPass(this.effectFXAA);
        // init surfaceFinder
        this.surfaceFinder.surfaceId = 0;
        // traverse scene to find all surfaces ids and update the surfaceId
        this.scene.traverse((child) => {
            if (child.isMesh) {
                const colorsTypedArray = this.surfaceFinder.getSurfaceIdAttribute(child);
                child.geometry.setAttribute(
                    "color",
                    new THREE.BufferAttribute(colorsTypedArray, 3)
                );
            }
        });
        this.CustomOutline.updateMaxSurfaceId(this.surfaceFinder.surfaceId + 1);
        this.CustomOutline.fsQuad.material.uniforms.outlineColor.value = new THREE.Vector3(0, 0, 0);
    }

    resize() {
        this.composer.setSize(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio);
        this.effectFXAA.setSize(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio);
        this.CustomOutline.setSize(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio);
        this.effectFXAA.uniforms["resolution"].value.set(
            1 / (window.innerWidth),
            1 / (window.innerHeight)
        );
    }

    update() {
        this.composer.render()
    }
}

