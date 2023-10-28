import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.resourcesReady = new Event('resourcesReady')

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        const loading = document.querySelector(".loading-bar")
        const loadingParent = document.querySelector(".loading-parent")
        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () => {
                window.setTimeout(() => {
                    loading.classList.add('ended')
                    loading.style.transform = ""
                }, 500);

            },
            //progress
            (url, itemsLoaded, itemsTotal) => {
                const progressRatio = itemsLoaded / itemsTotal
                loading.style.transform = `scaleX(${progressRatio})`
                if (progressRatio === 1) {
                    loadingParent.style.display = "none"
                }

            }
        )
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager)
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
        this.loaders.fbxLoader = new FBXLoader(this.loadingManager)
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('draco/');
    }

    startLoading() {
        // Load each source
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'dracoLoader'){
                this.loaders.gltfLoader.setDRACOLoader(this.dracoLoader)
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'fbxModel') {
                this.loaders.fbxLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file

        this.loaded++

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
            window.dispatchEvent(this.resourcesReady)        }
    }
}