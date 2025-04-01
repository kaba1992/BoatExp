import * as THREE from 'three';
import boostVertex from './../../../../static/shaders/Boat/boostVertex.glsl';
import boostFragment from './../../../../static/shaders/Boat/boostFragment.glsl';
class Boost {
    constructor(scene) {
        this.scene = scene;
        this.material = null;

        this.setboostBar();

    }

    setboostBar() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: boostVertex,
            fragmentShader: boostFragment,
            uniforms: {
                uTime: { value: 0.0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uAlphaTexture: { value: new THREE.TextureLoader().load('/textures/Ui/AlphaBot.jpg') }
            },
            transparent: true,
            // blending: THREE.AdditiveBlending,
            // wireframe: true,
        });
        const boostPlane = new THREE.PlaneGeometry(0.4,0.12, 1, 1);



        const mesh = new THREE.Mesh(boostPlane, this.material);

        this.scene.add(mesh);
    }

    update(delta) {
        this.material.uniforms.uTime.value +=  0.01;
        
    }
}

export default Boost;