import * as THREE from 'three'
import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import { gsap } from "gsap";
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";
import fragment from '../../../static/shaders/Boat/fragement.glsl'
import vertex from '../../../static/shaders/Boat/vertex.glsl'
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color } from "three-nebula"
export default class Boat {
    static modelBody
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.orbitControls = this.experience.camera.controls
        this.model = null
        this.velocity = 50
        this.rotVelocity = 2
        this.clock = new THREE.Clock()
        this.keyboard = new THREEx.KeyboardState()
        this.distance = null
        this.rotation = null
        this.boost = 400
        this.physic = this.experience.physic


        //Camera

        this.rotateAngle = new THREE.Vector3(0, 1, 0)
        this.rotateQuarternion = new THREE.Quaternion()
        this.cameraTarget = new THREE.Vector3()


        // Debug


        // Resource
        this.resource = this.resources.items.boatModel

        this.setModel()
        this.setKeyUp()
        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);
        this.setParticle()

    }




    setModel() {
        this.model = this.resource.scene.children[0]
        const childs = []
        const textures = []
        this.model.traverse((child) => {

            if (child instanceof THREE.Mesh) {
                childs.push(child)
                textures.push(child.material.map)
                child.castShadow = true


            }
        })

        for (let i = 0; i < childs.length; i++) {
            childs[i].material = new THREE.ShaderMaterial({
                fragmentShader: fragment,
                vertexShader: vertex,
                transparent: true,
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: textures[i] },
                    lightPosition: { value: new THREE.Vector3(1000, 1000, - 1.25) },
                    uColor: { value: childs[i].material.color }
                }
            })

            // window.setTimeout(
            //     // () => {
            //     //     gsap.to(
            //     //         childs[i].material.uniforms.lightPosition.z,
            //     //         {
            //     //             value: 20,
            //     //             duration: 5,
            //     //             repeat: -1,
            //     //             yoyo: true,
            //     //         }
            //     //     )
            //     // }, 1000
            // )

         

        }


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



        this.ThirdPersonCamera = new ThirdPersonCamera(
            {
                camera: this.camera,
                target: this.model,
            }
        )
        // Boat.modelBody = AddBody.setCustomBody(
        //     1000, {
        //     type: Body.DYNAMIC,
        //     fixedRotation: true,
        // },
        //     this.physic.world,
        //     {
        //         width: 45, height: 12, depth: 12
        //     })


    }
    setKeyUp() {
        window.addEventListener('keyup', (event) => {
            this.stop()
            if (event.key === 'Shift') {
                gsap.to(this.boatFlag1.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing: "easeOut" })
                gsap.to(this.boatFlag2.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing: "easeOut" })
                gsap.to(this.boatFlag3.scale, { x: 1, y: 0.1, z: 1, duration: 1, easing: "easeOut" })
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
            this.velocity = 50
            // console.log('boost ended');
        }
        else {
            this.velocity = 150
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
            gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
            gsap.to(this.boatFlag2.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
            gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
            // console.log("shift pressed");

        } else {
            this.velocity = 50
            this.fillBoost()
        }
    }


    setParticle() {
        this.system = new System()
        this.emitter = new Emitter()


        const group = new THREE.Group()

        this.scene.add(group)

        group.position.set(300, -3, -10)
        group.scale.set(1.5, 2.5, 5)
        group.rotateY(Math.PI / 2)

        this.renderer = new SpriteRenderer(group, THREE);
        const texture = new THREE.TextureLoader().load("../textures/foam.png")

        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                color: 0xffffff,
                transparent: true,
                depthWrite: false,
                depthTest: true,
                blending: THREE.AdditiveBlending,
                fog: true,
            })
        )

        const color = new THREE.Color("white");
        this.emitter
            .setRate(new Rate(new Span(10, 20), new Span(0.01)))
            .setInitializers([
                new Mass(1),
                new Radius(6, 8),
                new Life(1),
                new Body(sprite),
                new RadialVelocity(40, new Vector3D(0, 0, 1), 180),
            ])
            .setBehaviours([
                new Alpha(1, 0),
                new Scale(1, 2),
                new Color(color),
            ])
            .emit();

        this.system.addEmitter(this.emitter).addRenderer(this.renderer)
        this.group = group
        this.model.add(this.group)
        if (this.debug.active && this.model) {
            this.debugFolder = this.debug.ui.addFolder("group")
            this.debugFolder.add(this.group.position, 'y').min(-100).max(300).step(0.0001).name('positionX')
            this.debugFolder.add(this.group.position, 'x').min(-100).max(100).step(0.0001).name('positionY')
            this.debugFolder.add(this.group.position, 'z').min(-100).max(100).step(0.0001).name('positionZ')
            // rotation
            // this.debugFolder.add(this.group.rotation, 'x').min(0).max(Math.PI * 2).step(0.0001).name('rotationX')
            // this.debugFolder.add(this.group.rotation, 'y').min(0).max(Math.PI * 2).step(0.0001).name('rotationY')
            // this.debugFolder.add(this.group.rotation, 'z').min(0).max(Math.PI * 2).step(0.0001).name('rotationZ')
        }

    }



    update() {
        this.boatControls()
        this.updateSpeed()
        const elapsedTime = this.clock.getElapsedTime()
        const delta = this.clock.getDelta()
        if (this.model) {
            this.ThirdPersonCamera.update(this.time.delta)
            this.model.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 1;
            this.model.rotation.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.05;
            this.axesHelper.position.copy(this.model.position)
            // Boat.modelBody.position.copy(this.model.position)
            // Boat.modelBody.quaternion.copy(this.model.quaternion)


        }
        this.system.update(delta)

    }
}