import * as THREE from 'three'
import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import { gsap } from "gsap";

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
        this.boost = 400


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
        const boatPlane = this.model.getObjectByName('WaterPlane_Mat_Water_0')
        this.boatFlag1 = this.model.getObjectByName('StylShip_SailMid1_Mat_StylShip_SailsRope_0')
        this.boatFlag2 = this.model.getObjectByName('StylShip_SailFront_Mat_StylShip_SailsRope_0')
        this.boatFlag3 = this.model.getObjectByName('StylShip_SailMid2_Mat_StylShip_SailsRope_0')
        // boatFlag.scale(1, 0.1, 1)
        gsap.set(this.boatFlag1.scale, { x: 1, y: 0.1, z: 1 })
        gsap.set(this.boatFlag2.scale, { x: 1, y: 0.1, z: 1 })
        gsap.set(this.boatFlag3.scale, { x: 1, y: 0.1, z: 1 })
        boatPlane.visible = false
        this.model.scale.set(0.1, 0.1, 0.1)
        this.model.position.x = 0
        this.model.position.y = Math.random() * Math.PI * 2;
        this.model.position.z = 0
        this.model.userData.initFloating = Math.random() * Math.PI * 2;
        this.model.rotation.z = -Math.PI / 2.5;
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
            if (event.key === 'Shift') {
                gsap.to(this.boatFlag1.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing:"easeOut" })
                gsap.to(this.boatFlag2.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing:"easeOut" })
                gsap.to(this.boatFlag3.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing:"easeOut" })
            }
        })

    }

    fillBoost() {
        if (this.boost >= 400) return
        this.boost += 0.3
        // console.log(this.boost + "can fill");
    }

    unfillBoost() {
        if (this.boost > 0) {
            this.boost -= 0.6
            // console.log(this.boost);
            // console.log("can't fill");
        }
    }
    boostManager() {

        if (this.boost <= 0) {
            this.velocity = 30
            console.log('boost ended');
        }
        else {
            this.velocity = 60
        }

    }


    updateSpeed() {
        if (this.model) {
            this.model.rotation.z += this.rotation
            this.model.translateX(this.distance)

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
            this.boostManager()
            this.unfillBoost()
            gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease:"easeOut" })
            gsap.to(this.boatFlag2.scale, { x: 1, y: 1, z: 1, duration: 1, ease:"easeOut" })
            gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease:"easeOut" })
            console.log("shift pressed");

        } else {
            this.velocity = 30
            this.fillBoost()

        }



    }






    update() {

        this.boatControls()
        this.updateSpeed()
        const elapsedTime = this.clock.getElapsedTime()
        if (this.model) {
            this.ThirdPersonCamera.update(this.time.delta)
            this.model.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 1;
            this.model.rotation.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.05;
            this.axesHelper.position.copy(this.model.position)
        }
        // console.log(this.elapsedTime);

    }
}