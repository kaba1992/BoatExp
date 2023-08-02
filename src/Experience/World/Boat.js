
import * as THREE from 'three'
import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import { gsap } from "gsap";
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color } from "three-nebula"
import fragment from '../../../static/shaders/Boat/fragement.glsl'
import vertex from '../../../static/shaders/Boat/vertex.glsl'
import Sharks from './GameElements/Sharks.js';
import Islands from './GameElements/Islands.js';

export default class Boat {
  static modelBody
  static model
  static velocity


  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time
    this.camera = this.experience.camera.instance
    this.keyboard = new THREEx.KeyboardState()
    this.boost = 100
    this.physic = this.experience.physic
    this.boostBar = document.querySelector('.boostBar')
    this.boostProgress = document.querySelector('.boostProgress')
    this.boostProgress.innerHTML = `${this.boost}%`
    this.clock = new THREE.Clock()
    // this.octree = this.experience.octree
    // this.octree = new Octree()
    // this.colliider = new Capsule(new Vector3(0, 0, 0), new Vector3(0, 0, 0), 0)

    // Resource
    this.resource = this.resources.items.boatModel

    this.setModel()
    this.setKeyUp()
    this.setParticle()
    // this.axesHelper = new AxesHelper(5);
    // this.scene.add(this.axesHelper);

  }







  setModel() {

    this.model = this.resource.scene

    Boat.model = this.model
    // this.model.velocity = new Vector3(0, 0, 0)
    // this.boatFlag1 = this.model.getObjectByName('StylShip_SailMid1_Mat_StylShip_SailsRope_0')
    // this.boatFlag2 = this.model.getObjectByName('StylShip_SailFront_Mat_StylShip_SailsRope_0')
    // this.boatFlag3 = this.model.getObjectByName('StylShip_SailMid2_Mat_StylShip_SailsRope_0')

    this.childs = []
    const textures = []
    this.model.traverse((child) => {

      if (child instanceof THREE.Mesh) {
        this.childs.push(child)
        textures.push(child.material.map)

      }
    })




    // boatFlag.scale(1, 0.1, 1)
    // gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    // gsap.set(this.boatFlag2.scale, { x: 1, y: 1, z: 1 })
    // gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })
    // boatPlane.visible = false
    this.model.scale.set(0.2, 0.2, 0.2)
    // this.model.position.set(10, 0, -10)
    // this.model.position.x = 0
    // this.model.position.y = Math.random() * Math.PI * 2;
    // this.model.position.z = 0
    this.model.userData.initFloating = Math.random() * Math.PI * 2;

    // this.model.rotation.y = Math.PI / 2 ;
    // this.scene.add(this.model)
    //this.octree.add(this.model)



    this.ThirdPersonCamera = new ThirdPersonCamera(
      {
        camera: this.camera,
        target: this.model,
        speed: this.velocity,
      }

    )
    this.Shark = new Sharks(
      {
        boat: this.model,
      }
    )
    this.island = new Islands(
      {
        boat: this.model,
      }
    )
    Boat.modelBody = AddBody.setCustomBody(
      10, {
      // type: Body.DYNAMIC,
      fixedRotation: true,
      collisionFilterGroup: bodyTypes.BOAT,
      collisionFilterMask: bodyTypes.ROCK
    },
      this.physic.world,
      {
        width: 45, height: 24, depth: 24
      })

  }

  setParticle() {
    this.system = new System()
    this.emitter = new Emitter()


    this.particleGroup = new THREE.Group()

    this.scene.add(this.particleGroup)

    this.particleGroup.position.set(0,2, -3.5)
    this.particleGroup.scale.set(0.1,0.1, 0.1)
    // this.particleGroup.rotateY(-Math.PI / 2)

    this.particleRenderer = new SpriteRenderer(this.particleGroup, THREE);
    const texture = new THREE.TextureLoader().load("../textures/circle_03.png")

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

    const color = new THREE.Color("blue");
    this.emitter
      .setRate(new Rate(new Span(0.1, 1), new Span(0.2)))
      .setInitializers([
        new Mass(1),
        new Radius(6, 8),
        new Life(1),
        new Body(sprite),
        new RadialVelocity(40, new Vector3D(0, 0, -1), -180),
      ])
      .setBehaviours([
        new Alpha(1, 0.5),
        new Scale(1, 2),
        new Color(color),
      ])
      .emit();

    this.system.addEmitter(this.emitter).addRenderer(this.particleRenderer)
    console.log(this.system);

    this.model.add(this.particleGroup)
    // if (this.debug.active && this.model) {
    //   this.debugFolder = this.debug.ui.addFolder("particleGroup")
    //   this.debugFolder.add(this.particleGroup.position, 'y').min(-100).max(300).step(0.0001).name('positionY')
    //   this.debugFolder.add(this.particleGroup.position, 'x').min(-100).max(100).step(0.0001).name('positionX')
    //   this.debugFolder.add(this.particleGroup.position, 'z').min(-100).max(100).step(0.0001).name('positionZ')
    //   // rotation
    //   // this.debugFolder.add(this.group.rotation, 'x').min(0).max(Math.PI * 2).step(0.0001).name('rotationX')
    //   // this.debugFolder.add(this.group.rotation, 'y').min(0).max(Math.PI * 2).step(0.0001).name('rotationY')
    //   // this.debugFolder.add(this.group.rotation, 'z').min(0).max(Math.PI * 2).step(0.0001).name('rotationZ')
    // }

  }



  setKeyUp() {
    window.addEventListener('keyup', (event) => {
      if (event.key === 'Shift') {
        // gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
        // gsap.to(this.boatFlag2.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
        // gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
        // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })

      }
    })

  }

  fillBoost() {
    if (this.boost >= 100) return
    this.boost += 0.075
    this.boostBar.style.width = `${this.boost}%`
    this.boostProgress.innerHTML = `${Math.round(this.boost)}%`
    // console.log(this.boost + "can fill");
  }

  unfillBoost() {
    if (this.boost > 0) {
      this.boost -= 0.15
      this.boostBar.style.width = `${this.boost}%`
      this.boostProgress.innerHTML = `${Math.round(this.boost)}%`
      // console.log(this.boost);
      // console.log("can't fill");
    }
  }
  boostManager() {


    if (this.boost <= 0) {
      this.ThirdPersonCamera.speed = 0.02
      // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      // gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
      // gsap.to(this.boatFlag2.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
      // gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })

      // console.log('boost ended');
    }
    else {
      this.ThirdPersonCamera.speed = 0.07
    }
  }



  boatControls() {

    if (this.keyboard.pressed('shift')) {
      this.boostManager()
      this.unfillBoost()
      if (this.boost > 0) {
        // gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
        // gsap.to(this.boatFlag2.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
        // gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
        // gsap.to(this.particleGroup.scale, { x: 2, y: 3.5, z: 8, duration: 3, ease: "easeOut" })
      }

      // console.log("shift pressed");

    } else {
      this.ThirdPersonCamera.speed = 0.02
      this.fillBoost()
    }
  }


  update() {

    console.log(this.velocity);

    this.boatControls()
    const elapsedTime = this.time.elapsed * 0.0008
    const delta = this.clock.getDelta()
    if (this.model) {
      this.ThirdPersonCamera.update(this.time.delta)
      this.Shark.update(this.time.delta)
      this.island.update(this.time.delta)
      this.model.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.03;
      // this.model.rotation.z = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.05;
      // this.axesHelper.position.copy(this.model.position)
      // Boat.modelBody.position.copy(this.model.position)
      // Boat.modelBody.quaternion.copy(this.model.quaternion)
    }

    this.system.update(delta)
  }
}

