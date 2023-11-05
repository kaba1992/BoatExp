import * as THREE from 'three'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import RendererWater from './RendererWater.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import InitCannon from './Utils/InitCannon.js'
// import Stats from 'three/examples/jsm/libs/stats.module'
import { Octree } from '@brakebein/threeoctree';
import Stats from "stats-gl";

import sources from './sources.js'

let instance = null

export default class Experience {
    constructor(_canvas) {
        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = _canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.orthoScene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new RendererWater()
        this.physic = new InitCannon()
        this.world = new World()
        this.octree = new Octree({
            undeferred: false, // optional, default = false, octree will defer insertion until you call octree.update();
            depthMax: Infinity, // optional, default = Infinity, infinite depth
            objectsThreshold: 8, // optional, default = 8
            overlapPct: 0.15, // optional, default = 0.15 (15%), this helps sort objects that overlap nodes
            //scene: this.scene // optional, pass scene as parameter only if you wish to visualize octree
        })

        // create a new Stats object
        this.stats = new Stats({
            logsPerSecond: 20,
            samplesLog: 100,
            samplesGraph: 10,
            precision: 2,
            horizontal: true,
            minimal: false,
            mode: 2
        });
        // document.body.appendChild( this.stats.container );
        // this.stats.init( this.renderer.instance.domElement );
        this.scene.onBeforeRender = () => {
            // this.stats.begin();
        }

        this.scene.onAfterRender = () => {
            // this.stats.end();
        }



        // Resize event
        this.sizes.on('resize', () => {
            this.resize()
        })
        // this.stats = Stats()
        // document.body.appendChild(this.stats.dom)

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
        // this.world.resize()
    }

    update() {
        // this.stats.begin();
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.octree.update()
        this.resources.update()
        this.physic.update()
        // this.stats.end();
        // this.stats.update()
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if (this.debug.active)
            this.debug.ui.destroy()
    }
}