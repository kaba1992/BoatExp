import * as THREE from 'three'
import Experience from '../Experience.js'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

import Rock from './Rock.js'

export default class SkyWater {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.sizes = this.experience.sizes
        this.sun = new THREE.Vector3();
        this.water = null
        this.sky = null
        this.debug = this.experience.debug
        this.parameters = {
            elevation: 0.49,
            azimuth: 49
        }

        this.setWater()
        this.setSky()
    }

    setWater() {
        const waterGeometry = new THREE.PlaneGeometry(5000, 5000);
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('textures/Water_1_M_Normal.jpg', function (texture) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                // fog: scene.fog !== undefined
            }

        );
        this.water.rotation.x = - Math.PI / 2;
        this.scene.add(this.water);
        this.rock = new Rock({ water: this.water })

    }
    setSky() {
        this.sky = new Sky();
        this.sky.scale.setScalar(5000);
        this.scene.add(this.sky);

        const skyUniforms = this.sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;
        if (this.debug.active) {

            this.debugFolder = this.debug.ui.addFolder('environment')
            this.debugFolder
                .add(this.parameters, 'azimuth')
                .name('azimuth')
                .min(-100)
                .max(100)
                .step(0.0001)
            this.debugFolder
                .add(this.parameters, 'elevation')
                .name('elevation')
                .min(0)
                .max(4)
                .step(0.001)


        }
    }


    updateSun() {

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        const theta = Math.PI * (this.parameters.elevation - 0.5);
        const phi = 2 * Math.PI * (this.parameters.azimuth - 0.5);

        this.sun.x = Math.cos(phi);
        this.sun.y = Math.sin(phi) * Math.sin(theta);
        this.sun.z = Math.sin(phi) * Math.cos(theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
        this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

        this.scene.environment = pmremGenerator.fromScene(this.sky).texture;



    }



    update() {
        this.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.rock.update()
        this.updateSun()

    }
}