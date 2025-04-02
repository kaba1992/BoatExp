import * as THREE from 'three';
import boostVertex from './../../../../static/shaders/Boat/boostVertex.glsl';
import boostFragment from './../../../../static/shaders/Boat/boostFragment.glsl';
import THREEx from '../../Utils/keyboard.js';
import { gsap } from 'gsap';
class Boost {
    constructor(scene) {
        this.scene = scene;
        this.material = null;
        this.keyboard = new THREEx.KeyboardState()
        this.boostMultiplier = 1
        this.boost = 100
        this.canStartFill = false

        this.setboostBar();
        this.setListeners();

    }

    setListeners() {
        window.addEventListener('ready', () => {
            this.canStartFill = true
            gsap.to(this.material.uniforms.uOpacity, {
                duration: 1,
                value: 1,
                ease: 'power2.out',
            })
          })
          window.addEventListener('reset', () => {
            this.reset()
          })
    }

    setboostBar() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: boostVertex,
            fragmentShader: boostFragment,
            uniforms: {
                uTime: { value: 0.0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uAlphaTexture: { value: new THREE.TextureLoader().load('/textures/Ui/AlphaBot.jpg') },
                uRevealRatio: { value: 1. },
                uOpacity: { value: 0. },
            },
            transparent: true,
            side: THREE.DoubleSide,
            
            // depthTest: false,
            // depthWrite: false,
        
            // renderOrder  : 99,
    

        });
        const boostPlane = new THREE.PlaneGeometry(0.4, 0.20, 2, 2);

        const mesh = new THREE.Mesh(boostPlane, this.material);
    
        mesh.frustumCulled = false;
       

        this.scene.add(mesh);
    }

    fillBoost() {

        if (this.boost >= 100) return
        this.boost += 0.085
    }

    unfillBoost() {
        if (this.boost > 0) {
            this.boost -= 0.15
        }
    }
    boostManager() {

        if (this.boost <= 0) {
            this.boostMultiplier = 1
        }
        else {
            // this.ThirdPersonCamera.speed = 0.2
            this.boostMultiplier = 1.8
        }
    }

    remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    update(delta) {
        let boosRemap = this.remap(this.boost, 0, 100, 0, 1)
        console.log(boosRemap)
        this.material.uniforms.uRevealRatio.value = boosRemap;
        this.material.uniforms.uTime.value += 0.01;

        if (this.keyboard.pressed('shift') && this.boost > 0 && this.canStartFill) {

            this.boostManager();
            this.unfillBoost();

            // Effets visuels et sonores pour le boost
            if (!this.voileAudioPlayed) {

            }

        } else {

            this.boostMultiplier = 1;
            if(!this.canStartFill) return
            this.fillBoost();
        }

    }

    reset() {
        this.boost = 100
        this.boostMultiplier = 1
        this.material.uniforms.uRevealRatio.value = 1;
        this.material.uniforms.uOpacity.value = 0;
        this.canStartFill = false
      
    }

}

export default Boost;