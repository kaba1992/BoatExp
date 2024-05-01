import * as THREE from 'three'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import RendererWater from './RendererWater.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import Timer from '../UI/Timer.js'
import UiManager from '../UI/UiManager.js'
import Reveal from './World/GameElements/Reaveal.js'
import Ranking from './World/GameElements/Ranking.js'


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
        this.scene.background = new THREE.Color(0xffffff).convertSRGBToLinear();
        this.orthoScene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new RendererWater()
       
        this.world = new World()
        this.timer = new Timer(60, document.querySelector('.timer-text'));
        this.reveal = new Reveal();
        this.uiManager = new UiManager();
        this.ranking = new Ranking();
 

        // create a new Stats object
        // this.stats = new Stats({
        //     logsPerSecond: 20,
        //     samplesLog: 100,
        //     samplesGraph: 10,
        //     precision: 2,
        //     horizontal: true,
        //     minimal: false,
        //     mode: 2
        // });
        // document.body.appendChild(this.stats.container);
        // this.stats.init(this.renderer.instance.domElement);
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



        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
        window.addEventListener('reset', () => {
            // this.destroy()
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
        this.resources.update()
        this.timer.update();
        this.reveal.update();
        this.ranking.update();

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


        this.renderer.instance.dispose()

        if (this.debug.active)
            this.debug.ui.destroy()
    }
}