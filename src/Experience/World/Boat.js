import * as THREE from 'three'
import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'

export default class Boat {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.orbitControls = this.experience.camera.controls
        this.model = null
        this.velocity = 30
        this.rotVelocity = 2
        this.clock = new THREE.Clock()
        this.keyboard = new THREEx.KeyboardState()
        this.distance = null
        this.rotation = null
        this.boost = 60
        this.boostFinished = true
        this.boostInterv = null



        //Camera

        this.rotateAngle = new THREE.Vector3(0, 1, 0)
        this.rotateQuarternion = new THREE.Quaternion()
        this.cameraTarget = new THREE.Vector3()


        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('boat')
        }

        // Resource
        this.resource = this.resources.items.boatModel

        this.setModel()
        this.fillBoost()

    }




    setModel() {
        this.model = this.resource.scene.children[0]

        this.model.scale.set(8, 8, 8)
        this.model.position.set(0, 2, 0)
        this.model.rotation.z = Math.PI * 1.5;
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
        this.ThirdPersonCamera = new ThirdPersonCamera(
            {
                camera: this.camera,
                target: this.model,
            }
        )
        window.addEventListener('keyup', (event) => {
            this.stop()

        })
    }

    fillBoost() {

        if (this.boostFinished) {
            // add 1 to boost every 1 seconds
            this.boostInterv = setInterval(() => {
                console.log(this.boost);
                if (this.boost >= 60) return
                this.boost += 1
            }, 500)

        }

        if (this.keyboard.pressed('shift')) {
            this.boostManager(this.boost, this.velocity)
            console.log("shift pressed");
        } else {
            this.velocity = 30

        }
    }


    updateSpeed() {
        if (this.model) {
            this.model.rotation.z += this.rotation
            this.model.translateY(this.distance)
        }
    }

    stop() {
        if (this.model) {
            this.distance = 0
            this.rotation = 0
        }
    }

    boatControls() {
        this.delta = this.clock.getDelta()
        if (this.keyboard.pressed('left') || this.keyboard.pressed('q')) {
            this.rotation = this.rotVelocity * this.delta
        }
        if (this.keyboard.pressed('right') || this.keyboard.pressed('d')) {
            this.rotation = -this.rotVelocity * this.delta
        }
        if (this.keyboard.pressed('up') || this.keyboard.pressed('z')) {
            this.distance = -this.velocity * this.delta
        }
        if (this.keyboard.pressed('down') || this.keyboard.pressed('s')) {
            this.distance = (this.velocity / 4) * this.delta
        }

    }


    boostManager(boost, velocity) {
        this.boost = boost
        this.velocity = velocity
        this.boost = 60

        if (this.boost > 0) {
            this.boost -= 0.5
            console.log(this.boost);
        }


        if (this.boost <= 0) {
            this.velocity = 30
            console.log('boost ended');
        }
        else {
            this.velocity = 60
            console.log('boost');
        }

    }



    update() {
        this.updateSpeed()
        this.boatControls()
        if (this.model) {
            this.ThirdPersonCamera.update(this.time.delta)
        }

        // console.log(this.elapsedTime);

    }
}