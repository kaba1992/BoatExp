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
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            }
            // wireframe: true,
        });
        const boostPlane = new THREE.PlaneGeometry(0.6,0.1, 1, 1);



        const mesh = new THREE.Mesh(boostPlane, this.material);

        this.scene.add(mesh);
    }

    update(delta) {
        this.material.uniforms.uTime.value = delta * 0.5;
        
    }
}

export default Boost;