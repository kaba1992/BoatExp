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
        this.currentRatio = 0;
        this.targetRatio = 0;

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        const loading = document.querySelector(".loading-bar")
        const loadingShark = document.querySelector(".loading-shark")
        const loadingParent = document.querySelector(".loading-parent")
        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () => {
                window.setTimeout(() => {
                    loading.classList.add('ended')
                    loading.style.transform = ""
                    // loadingShark.style.left = ""
                }, 500);

            },
            //progress
            (url, itemsLoaded, itemsTotal) => {
                this.targetRatio = itemsLoaded / itemsTotal
                // const windowWidth = window.innerWidth;

                // let maxPosition;

                // if (windowWidth <= 480) { // Mobiles
                //     maxPosition = 50; // Vous pouvez ajuster cette valeur
                // } else if (windowWidth <= 768) { // Tablettes
                //     maxPosition = 80; // Vous pouvez ajuster cette valeur
                // } else { // PC et autres grandes tailles d'écran
                //     maxPosition = 100; // Vous pouvez ajuster cette valeur
                // }

                // const newPosition = progressRatio * maxPosition;
                // loadingShark.style.left = `${newPosition}vw`;
                // loading.style.transform = `scaleX(${progressRatio})`

                if (this.targetRatio  === 1) {
                    setTimeout(() => {
                        loadingParent.style.display = "none"
                    }, 1000);
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

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
            window.dispatchEvent(this.resourcesReady)
        }
    }

    update() {
        this.currentRatio += (this.targetRatio - this.currentRatio) * 0.05;

        const windowWidth = window.innerWidth;
        let maxPosition;

        if (windowWidth <= 480) { // Mobiles
            maxPosition = 50;
        } else if (windowWidth <= 768) { // Tablettes
            maxPosition = 80;
        } else { // PC et autres grandes tailles d'écran
            maxPosition = 100;
        }

        const newPosition = this.currentRatio * maxPosition;
        const loadingShark = document.querySelector(".loading-shark");
        loadingShark.style.left = `${newPosition}vw`;

    }
}