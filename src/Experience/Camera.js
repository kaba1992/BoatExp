import { PerspectiveCamera } from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.orthoScene = this.experience.orthoScene
        this.canvas = this.experience.canvas

        this.setInstance()
        // this.setControls()
    }

    setInstance() {
        this.instance = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
        // this.instanceOrtho = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        // this.instance.position.set(0, 5, -8);

        this.scene.add(this.instance)
        // this.orthoScene.add(this.instanceOrtho)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        // this.controls.update()
    }
}