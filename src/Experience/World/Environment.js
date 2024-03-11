import { DirectionalLight, FogExp2, DirectionalLightHelper, AmbientLight, EquirectangularReflectionMapping,PointLight, Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader } from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
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
        this.sunLight.position.set(0, 150, 1000);
        this.scene.add(this.sunLight)
        const ambientLight = new AmbientLight("#ffffff", 1);

        const pointLight = new PointLight(0xffffff, 1.5, 2000, 0);
        pointLight.color.setHSL(0.08, 0.8, 0.5);
        pointLight.position.set(0, 150, 1000);
        this.scene.add(pointLight);
     

        this.scene.add(ambientLight);
        this.lensFlare = new Lensflare();
        this.lensFlare.addElement(new LensflareElement(this.resources.items.textureFlare0, 700, 0, pointLight.color));
        this.lensFlare.addElement(new LensflareElement(this.resources.items.textureFlare3, 60, 0.6));
        this.lensFlare.addElement(new LensflareElement(this.resources.items.textureFlare3, 70, 0.7));
        this.lensFlare.addElement(new LensflareElement(this.resources.items.textureFlare3, 120, 0.9));
        this.lensFlare.layers.enable(1);
        this.lensFlare.layers.set(1);
        pointLight.add(this.lensFlare);

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
        this.scene.background.rotation.y = Math.PI / 2;

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

    }

    update() {
        this.environmentMap.updateMaterials()

    }
}