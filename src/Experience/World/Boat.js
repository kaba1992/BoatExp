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
        this.boost = 20
        this.isRunning = false
        this.fillBoostInterv = null
        this.unfillBoostInterv = null
        this.canBoost = true
        this.canFill = true

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
        this.setKeyUp()
        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

    }




    setModel() {
        this.model = this.resource.scene.children[0]

        this.model.scale.set(8, 8, 8)
        this.model.position.x = 0
        this.model.position.y = Math.random() * Math.PI * 2;
        this.model.position.z = 0
        this.model.userData.initFloating = Math.random() * Math.PI * 2;
        this.model.rotation.z = 2 * Math.PI / 1.9;
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

    }
    setKeyUp() {
        window.addEventListener('keyup', (event) => {
            this.stop()
            this.canBoost = true
            if (this.canFill) {
                this.fillBoost()
                console.log("can fill");
            }

        })
    }

    fillBoost() {

        if (!this.isRunning) {
            // add 1 to boost every 1 seconds
            this.fillBoostInterv = setInterval(() => {
                if (this.boost >= 20) return
                this.boost += 1
                console.log(this.boost);
                console.log("can fill");

            }, 1000)

        }
    }

    unfillBoost() {
        if (this.isRunning) {
            this.unfillBoostInterv = setInterval(() => {
                if (this.boost > 0) {
                    this.boost -= 1
                    console.log(this.boost);
                    console.log("can't fill");

                }

            }, 1000);
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
        if (this.keyboard.pressed('shift')) {
            if (this.canBoost) {

                this.boostManager()
                this.unfillBoost()
                this.canBoost = false

                clearInterval(this.fillBoostInterv)
            }
            this.canFill = false
        } else {
            this.velocity = 30
            clearInterval(this.unfillBoostInterv)

            this.canFill = true
            this.isRunning = false

        }



    }


    boostManager() {

        if (this.boost <= 0) {
            this.velocity = 30
            console.log('boost ended');
        }
        else {
            this.velocity = 60
            this.isRunning = true

            console.log('boost');
        }

    }



    update() {

        this.updateSpeed()
        this.boatControls()
        const elapsedTime = this.clock.getElapsedTime()
        if (this.model) {
            this.ThirdPersonCamera.update(this.time.delta)
            this.model.position.y = 1.5 + Math.sin(this.model.userData.initFloating + elapsedTime) * 0.8;
            


            this.axesHelper.position.copy(this.model.position)
        }
        // console.log(this.elapsedTime);

    }
}