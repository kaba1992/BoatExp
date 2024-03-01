import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'


export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.resourcesReady = new Event('resourcesReady')
        this.currentRatio = 0;
        this.targetRatio = 0;


        this.setLoaders()
        this.startLoading()
        this.isAllLoaded = false
        this.loadingParent = document.querySelector(".loading-parent")
    }

    setLoaders() {
        const loading = document.querySelector(".loading-bar")
        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () => {
                window.setTimeout(() => {
                    // loading.classList.add('ended')
                    // loading.style.transform = ""
                    // loadingShark.style.left = ""
                }, 500);

            },
            //progress
            (url, itemsLoaded, itemsTotal) => {
                this.targetRatio = itemsLoaded / itemsTotal


                if (this.targetRatio === 1) {

                    // this.loadingParent.style.display = "none"

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
            else if (source.type === 'dracoLoader') {
                this.loaders.gltfLoader.setDRACOLoader(this.dracoLoader)
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
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
        const loadingShark = document.querySelector(".loading-shark");

        if (this.loaded === this.toLoad) {

            const loadingShark = document.querySelector(".loading-shark");


            gsap.to(loadingShark, {
                duration: 3, left: "100%", ease: "power2.inOut", onComplete: () => {
                        // this.loadingParent.style.display = "none"
                        gsap.to(this.loadingParent, {
                            duration: 1, opacity: 0, ease: "power2.inOut", onComplete: () => {
                                // this.loadingParent.style.display = "none"
                            }
                        })
                        const resourcesReadyEvent = new Event('resourcesReady')
                        window.dispatchEvent(resourcesReadyEvent)
                }
            })
            this.trigger('ready')


            this.isAllLoaded = true
        }
    }

    update() {
        this.currentRatio += (this.targetRatio - this.currentRatio) * 0.05;




    }
}