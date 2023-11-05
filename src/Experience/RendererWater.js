import {
    AmbientLight,
    WebGLRenderer,
    WebGLRenderTarget,
    DepthTexture,
    UnsignedShortType,
    MeshDepthMaterial,
    RGBADepthPacking,
    NoBlending,
    TextureLoader,
    Vector4,
    Vector2,
    PlaneGeometry,
    ShaderMaterial,
    UniformsUtils,
    UniformsLib,
    Mesh,
    MeshStandardMaterial,
    Clock,
    NearestFilter,
    RepeatWrapping,
    SRGBColorSpace,
    RGBAFormat,
} from 'three'
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import Experience from './Experience.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import fragmentPiscine from './../../static/shaders/Boat/fragmentPiscine.glsl'
import vertexPiscine from './../../static/shaders/Boat/vertexPiscine.glsl'
import GUI from 'lil-gui'

export default class RendererWater {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.orthoScene = this.experience.orthoScene
        this.camera = this.experience.camera
        this.cameraOrtho = this.experience.camera.instanceOrtho
        this.clock = new Clock()

        if (this.debug.active) {
            // this.debugFolder = this.debug.ui.addFolder('rendererWater')
        }

        this.setInstance()
        this.setWater()
    }

    setInstance() {
        const ambientLight = new AmbientLight("#ffffff", 0.5);
        this.scene.add(ambientLight);

        this.pixelRatio = Math.min(this.sizes.pixelRatio, 2)

        this.instance = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.pixelRatio)
        this.outlineEffect = new OutlineEffect(this.instance, {
            defaultThickness: 0.002,
            blur: true,	// Enable blurring
            xRay: true

        });
        console.log(this.outlineEffect);

        const width = window.innerWidth * this.pixelRatio;
        const height = window.innerHeight * this.pixelRatio;

        this.renderTexture = new WebGLRenderTarget(width, height, {
            format: RGBAFormat,
            stencilBuffer: false,
        });
        this.renderTexture.texture.minFilter = NearestFilter,
            this.renderTexture.texture.magFilter = NearestFilter,
            this.renderTexture.texture.generateMipmaps = false,

            this.depthTextureTarget = new WebGLRenderTarget(width, height);
        this.depthTextureTarget.texture.minFilter = NearestFilter;
        this.depthTextureTarget.texture.magFilter = NearestFilter;
        this.depthTextureTarget.texture.generateMipmaps = false;
        this.depthTextureTarget.stencilBuffer = false;

        if (this.supportsDepthTextureExtension) {
            this.depthTextureTarget.depthTexture = new DepthTexture();
            this.depthTextureTarget.depthTexture.type = UnsignedShortType;
            this.depthTextureTarget.depthTexture.minFilter = NearestFilter;
            this.depthTextureTarget.depthTexture.maxFilter = NearestFilter;
        }

        this.depthMaterial = new MeshDepthMaterial();
        this.depthMaterial.depthPacking = RGBADepthPacking;
        this.depthMaterial.blending = NoBlending;
    }

    setWater(supportsDepthTextureExtension) {
        const textureLoader = new TextureLoader();
        const WaterDistortionTexture = textureLoader.load('textures/testAssets/WaterDistortion.png')
        WaterDistortionTexture.wrapS = WaterDistortionTexture.wrapT = RepeatWrapping
        const WaterNoiseTexture = textureLoader.load('textures/testAssets/PerlinNoise.png')
        WaterNoiseTexture.wrapS = WaterNoiseTexture.wrapT = RepeatWrapping
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
            _SurfaceNoise_ST: { value: new Vector4() },
            _SurfaceDistortion_St: { value: new Vector4() },
            resolution: {
                value: new Vector2()
            },

            _DepthMaxDistance: { value: 0 },
            _FoamDistance: { value: 0 },

            _SurfaceNoiseCutoff: { value: 0 },
            _SurfaceDistortionAmount: { value: 0 },

        }

        // materials
        this.waterMaterial = new ShaderMaterial({
            defines: {
                DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
                ORTHOGRAPHIC_CAMERA: 0
            },
            uniforms: UniformsUtils.merge([UniformsLib["fog"], this.waterUniforms]),
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
        this.waterMaterial.uniforms._SurfaceNoise_ST.value = new Vector4(4, 4, 1, 1);
        this.waterMaterial.uniforms._SurfaceDistortion_St.value = new Vector4(3, 3, 3, 3);
        this.waterMaterial.uniforms.uCameraNormalsTexture.value = this.depthTextureTarget.texture;
        this.waterMaterial.uniforms.resolution.value.set(
            window.innerWidth * this.sizes.pixelRatio,
            window.innerHeight * this.sizes.pixelRatio
        )
        const waterGeometry = new PlaneGeometry(500, 500);

        this.water = new Mesh(waterGeometry, this.waterMaterial)
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

        this.instance.setRenderTarget(this.renderTexture);
        this.instance.render(this.scene, this.camera.instance, this.renderTexture, true);
        this.instance.render(this.scene, this.camera.instance);
        this.instance.setRenderTarget(null);



        this.instance.render(this.scene, this.camera.instance);
        this.camera.instance.layers.enable(1);
        this.instance.render(this.scene, this.camera.instance);

        this.outlineEffect.render(this.scene, this.camera.instance);


    }
}