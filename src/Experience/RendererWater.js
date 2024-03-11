import * as THREE from 'three'
import Experience from './Experience.js'
import fragmentPiscine from './../../static/shaders/Boat/fragmentPiscine.glsl'
import vertexPiscine from './../../static/shaders/Boat/vertexPiscine.glsl'
import GUI from 'lil-gui'
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';


export default class RendererWater {
    constructor(reveal) {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.composer = this.experience.composer
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.orthoScene = this.experience.orthoScene
        this.camera = this.experience.camera
        this.cameraOrtho = this.experience.camera.instanceOrtho
        this.clock = new THREE.Clock()
        console.log(reveal);
        // this.revealComposer = this.experience.reveal.composer


        if (this.debug.active) {
            // this.debugFolder = this.debug.ui.addFolder('rendererWater')
        }

        this.setInstance()
        this.setWater()
    }

    setInstance() {
        this.pixelRatio = Math.min(this.sizes.pixelRatio, 2)

        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,

        })
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.pixelRatio)
        // this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        // this.instance.toneMappingExposure = 1;
        this.outlineEffect = new OutlineEffect(this.instance, {
            defaultThickness: 0.002,
            blur: true,	// Enable blurring
            xRay: true

        });


        const width = window.innerWidth * this.pixelRatio;
        const height = window.innerHeight * this.pixelRatio;

        this.renderTexture = new THREE.WebGLRenderTarget(width, height, {
            format: THREE.RGBAFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
            // stencilBuffer: true,
        });


        this.depthTextureTarget = new THREE.WebGLRenderTarget(width, height);
        this.depthTextureTarget.texture.minFilter = THREE.LinearFilter;
        this.depthTextureTarget.texture.magFilter = THREE.LinearFilter;
        this.depthTextureTarget.texture.generateMipmaps = false;
        this.depthTextureTarget.stencilBuffer = false;

        if (this.supportsDepthTextureExtension) {
            this.depthTextureTarget.depthTexture = new DepthTexture();
            this.depthTextureTarget.depthTexture.type = THREE.UnsignedShortType;
            this.depthTextureTarget.depthTexture.minFilter = THREE.LinearFilter;
            this.depthTextureTarget.depthTexture.maxFilter = THREE.LinearFilter;
        }

        this.depthMaterial = new THREE.MeshDepthMaterial();
        this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
        this.depthMaterial.blending = THREE.NoBlending;
    }

    setWater(supportsDepthTextureExtension) {
        const textureLoader = new THREE.TextureLoader();
        const WaterDistortionTexture = textureLoader.load('textures/testAssets/WaterDistortion.png')
        WaterDistortionTexture.wrapS = WaterDistortionTexture.wrapT = THREE.RepeatWrapping
        const WaterNoiseTexture = textureLoader.load('textures/testAssets/PerlinNoise.png')
        WaterNoiseTexture.wrapS = WaterNoiseTexture.wrapT = THREE.RepeatWrapping
        // const textureMapRock = textureLoader.load('textures/testAssets/Rock1_BaseColor.png')

        this.waterUniforms = {
            uDepthTexture: { value: null },
            uCameraProjectionMatrix: { value: null },
            cameraNear: { value: 0 },
            cameraFar: { value: 0 },
            uCameraNormalsTexture: { value: null },
            uTime: { value: 0 },
            _SurfaceNoise: { value: null },
            _SurfaceDistortion: { value: null },
            _SurfaceNoise_ST: { value: new THREE.Vector4() },
            _SurfaceDistortion_St: { value: new THREE.Vector4() },
            resolution: {
                value: new THREE.Vector2()
            },

            _DepthMaxDistance: { value: 0 },
            _FoamDistance: { value: 0 },

            _SurfaceNoiseCutoff: { value: 0 },
            _SurfaceDistortionAmount: { value: 0 },

        }

        // materials
        this.waterMaterial = new THREE.ShaderMaterial({
            defines: {
                DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
                ORTHOGRAPHIC_CAMERA: 0
            },
            uniforms: new THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], this.waterUniforms]),
            vertexShader: vertexPiscine,
            fragmentShader: fragmentPiscine,
            // transparent: true,
            fog: true,
        })

        this.waterMaterial.uniforms.uDepthTexture.value = supportsDepthTextureExtension === true ? this.depthTextureTarget.depthTexture : this.depthTextureTarget.texture;
        this.waterMaterial.uniforms.uCameraProjectionMatrix.value = this.camera.instance.projectionMatrix;
        this.waterMaterial.uniforms.cameraNear.value = this.camera.instance.near;
        this.waterMaterial.uniforms.cameraFar.value = this.camera.instance.far;
        this.waterMaterial.uniforms._SurfaceDistortion.value = WaterDistortionTexture;
        this.waterMaterial.uniforms._SurfaceNoise.value = WaterNoiseTexture;
        this.waterMaterial.uniforms._SurfaceNoise_ST.value = new THREE.Vector4(4, 4, 1, 1);
        this.waterMaterial.uniforms._SurfaceDistortion_St.value = new THREE.Vector4(3, 3, 3, 3);
        this.waterMaterial.uniforms.uCameraNormalsTexture.value = this.depthTextureTarget.texture;
        this.waterMaterial.uniforms.resolution.value.set(
            window.innerWidth * this.sizes.pixelRatio,
            window.innerHeight * this.sizes.pixelRatio
        )
        const waterGeometry = new THREE.PlaneGeometry(500, 500);

        this.water = new THREE.Mesh(waterGeometry, this.waterMaterial)
        this.water.rotation.x = - Math.PI * 0.5

        this.water.material = this.waterMaterial
        this.water.receiveShadow = true
        // this.waterFloor=  this.water.clone()
        // this.waterFloor.position.y = - 10
        // this.scene.add(this.waterGround)
        this.scene.add(this.water)

    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.pixelRatio)
        this.waterMaterial.uniforms.resolution.value.set(
            window.innerWidth * this.sizes.pixelRatio,
            window.innerHeight * this.sizes.pixelRatio
        )
        this.depthTextureTarget.setSize(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)
    }

    update() {
        this.water.visible = false
        this.camera.instance.layers.set(0);
        this.camera.instance.layers.enable(0);
        this.camera.instance.layers.disable(1);
        this.scene.overrideMaterial = this.depthMaterial;
        this.instance.setRenderTarget(this.depthTextureTarget);
        this.instance.render(this.scene, this.camera.instance);
        this.instance.setRenderTarget(null);
        this.scene.overrideMaterial = null;
        this.water.visible = true

        const time = this.clock.getElapsedTime();
        this.waterMaterial.uniforms.uTime.value = time


        if (this.renderTexture) {
            this.instance.setRenderTarget(this.renderTexture);
            this.instance.render(this.scene, this.camera.instance, this.renderTexture, true);
        }
        // this.instance.render(this.scene, this.camera.instance);
        this.instance.setRenderTarget(null);



        // this.instance.render(this.scene, this.camera.instance);
        this.camera.instance.layers.enable(1);

        this.instance.render(this.scene, this.camera.instance);
        this.outlineEffect.render(this.scene, this.camera.instance);
    }
}