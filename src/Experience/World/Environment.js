import { DirectionalLight,FogExp2, DirectionalLightHelper, AmbientLight, EquirectangularReflectionMapping, Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader } from 'three';

import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            // this.debugFolder = this.debug.ui.addFolder('environment')
        }

        this.setSunLight()
        this.setEnvironmentMap()
    }


    setSunLight() {
        this.sunLight = new DirectionalLight('#ffffff', 1)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(4096, 4096)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(5, 10, 7.5);
        this.scene.add(this.sunLight)
        const ambientLight = new AmbientLight("#ffffff", 1);

        this.scene.add(ambientLight);
        // const helper = new DirectionalLightHelper(this.sunLight, 1000);
        // this.scene.add(helper);


    }

    setEnvironmentMap() {
        const textureLoader = new TextureLoader()
        // this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap = textureLoader.load('/textures/environmentMap/newSky.jpg')
        this.environmentMap.intensity = 0.4
        this.environmentMap.colorSpace = SRGBColorSpace
        this.environmentMap.mapping = EquirectangularReflectionMapping;


        this.scene.environment = this.environmentMap
        this.scene.background = this.environmentMap

        this.scene.fog = new FogExp2(0xDFE9F3, 0.005);
    

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
                    // child.material.envMap = this.environmentMap.texture
                    // child.material.envMapIntensity = this.environmentMap.intensity
                    // child.material.needsUpdate = true
                }
            })
        }

        // Debug
        if (this.debug.active) {
            // this.debugFolder
            //     .add(this.environmentMap, 'intensity')
            //     .name('envMapIntensity')
            //     .min(0)
            //     .max(4)
            //     .step(0.001)
            //     .onChange(this.environmentMap.updateMaterials)
        }
    }

    update() {
        this.environmentMap.updateMaterials()

    }
}