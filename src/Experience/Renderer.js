import * as THREE from 'three'
import Experience from './Experience.js'
import Boat from './World/Boat.js';
import fragmentPiscine from './../../static/shaders/Boat/fragmentPiscine.glsl'
import vertexPiscine from './../../static/shaders/Boat/vertexPiscine.glsl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.orthoScene = this.experience.orthoScene
        this.camera = this.experience.camera
        this.cameraOrtho = this.experience.camera.instanceOrtho
        this.depthMaterial = null
        this.clock = new THREE.Clock()
        this.model = null

        this.setInstance()
        this.setPiscine()

    }

    setInstance() {

        var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        this.scene.add(ambientLight);
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        // this.instance.physicallyCorrectLights = true
        // this.instance.outputEncoding = THREE.sRGBEncoding
        // this.instance.toneMapping = THREE.CineonToneMapping
        // this.instance.toneMappingExposure = 1.75
        // this.instance.shadowMap.enabled = true
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        this.instance.gammaOutput = true;
        this.pixelRatio = this.instance.getPixelRatio();

    }

    setPiscine() {

        const supportsDepthTextureExtension = !!this.instance.extensions.get(
            "WEBGL_depth_texture"
        );
        this.depthTextureTarget = new THREE.WebGLRenderTarget(
            window.innerWidth * this.sizes.pixelRatio,
            window.innerHeight * this.sizes.pixelRatio
        );
        this.depthTextureTarget.texture.minFilter = THREE.NearestFilter;
        this.depthTextureTarget.texture.magFilter = THREE.NearestFilter;
        this.depthTextureTarget.texture.generateMipmaps = false;
        this.depthTextureTarget.stencilBuffer = false;
        if (supportsDepthTextureExtension == true) {
            this.depthTextureTarget.depthTexture = new THREE.DepthTexture();
            this.depthTextureTarget.depthTexture.type = THREE.UnsignedShortType;
            this.depthTextureTarget.depthTexture.minFilter = THREE.NearestFilter;
            this.depthTextureTarget.depthTexture.maxFilter = THREE.NearestFilter;

        }
        this.depthMaterial = new THREE.MeshDepthMaterial();
        this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
        this.depthMaterial.blending = THREE.NoBlending;

        const textureLoader = new THREE.TextureLoader();
        const gltfLoader = new GLTFLoader();
        let piscineRessource;
        gltfLoader.load('models/Boat/scenePiscine.glb', (gltf) => {

            // bind model to class
            this.piscineRessource = gltf.scene
            const WaterDistortionTexture = textureLoader.load('textures/testAssets/WaterDistortion.png')
            WaterDistortionTexture.wrapS = WaterDistortionTexture.wrapT = THREE.RepeatWrapping
            const WaterNoiseTexture = textureLoader.load('textures/testAssets/PerlinNoise.png')
            WaterNoiseTexture.wrapS = WaterNoiseTexture.wrapT = THREE.RepeatWrapping
            // const textureMapRock = textureLoader.load('textures/testAssets/Rock1_BaseColor.png')
            this.piscineModel = this.piscineRessource
            this.scene.add(this.piscineModel)
            this.piscineModel.position.set(0, 0, 0)
            this.piscineModel.scale.set(0.2, 0.2, 0.2)
            this.water = this.piscineModel.getObjectByName('Water')
            this.water.scale.set(0.2, 0.2, 0.2)
            const rock = this.piscineModel.getObjectByName('Rock')
            const log = this.piscineModel.getObjectByName('Log')
            const lifesaver = this.piscineModel.getObjectByName('Lifesaver')
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
            }

            // const waterGeometry = new THREE.PlaneGeometry(10, 10);
            // materials
            this.waterMaterial = new THREE.ShaderMaterial({
                defines: {
                    DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
                    ORTHOGRAPHIC_CAMERA: 0
                },
                uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], this.waterUniforms]),
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
            this.waterMaterial.uniforms._SurfaceNoise_ST.value = new THREE.Vector4(1, 4, 1, 1);
            this.waterMaterial.uniforms._SurfaceDistortion_St.value = new THREE.Vector4(1, 1, 1, 1);
            this.waterMaterial.uniforms.uCameraNormalsTexture.value = this.depthTextureTarget.texture;
            this.waterMaterial.uniforms.resolution.value.set(
                window.innerWidth * this.sizes.pixelRatio,
                window.innerHeight * this.sizes.pixelRatio
            )
            // this.water.rotation.x = - Math.PI * 0.5
            // this.water = new THREE.Mesh(waterGeometry, this.waterMaterial)
            // this.water.position.set(0, 0, 0)
            // this.water.rotation.x = - Math.PI * 0.5
            this.scene.add(this.water)

            const rockMaterial = new THREE.MeshStandardMaterial({
                // grey color
                color: 0x808080,
                // map: textureLoader.load('textures/testAssets/Rock1_BaseColor.png'),


            })
            const logMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load('textures/testAssets/Log.png'),
            })
            const lifesaverMaterial = new THREE.MeshStandardMaterial({
                map: textureLoader.load('textures/testAssets/Lifesaver.png'),
            })
            rock.material = rockMaterial
            log.material = logMaterial
            lifesaver.material = lifesaverMaterial
            this.water.material = this.waterMaterial
            // const postPlane = new THREE.PlaneGeometry(2, 2);
            // this.postPlaneMaterial = new THREE.ShaderMaterial({
            //   vertexShader: document.querySelector('#post-vert').textContent.trim(),
            //   fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            //   uniforms: {
            //     uDepth: { value: null },
            //     cameraNear: { value: this.camera.near },
            //     cameraFar: { value: this.camera.far },
            //   },
            // });

            // const postQuad = new THREE.Mesh(postPlane, this.postPlaneMaterial);

            // this.orthoScene.add(postQuad);
            console.log(supportsDepthTextureExtension);
        })



    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        if (this.waterMaterial != null) {
            this.waterMaterial.uniforms.resolution.value.set(
                window.innerWidth * this.sizes.pixelRatio,
                window.innerHeight * this.sizes.pixelRatio
            )

        }
        this.depthTextureTarget.setSize(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)
    }

    update() {
        if (this.water != null) {
            this.water.visible = false
        }
        this.scene.overrideMaterial = this.depthMaterial;
        this.instance.setRenderTarget(this.depthTextureTarget);
        this.instance.render(this.scene, this.camera.instance);
        this.instance.setRenderTarget(null);
        this.scene.overrideMaterial = null;
        if (this.water != null) {
            this.water.visible = true
        }
        const time = this.clock.getElapsedTime();

        if (this.waterMaterial != null) {
           
            this.waterMaterial.uniforms.uTime.value = time

        }
        this.instance.render(this.scene, this.camera.instance);
        //  console.log(this.supportsDepthTextureExtension );
    }
}