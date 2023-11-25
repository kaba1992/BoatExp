
import * as THREE from 'three'

import Experience from '../../Experience.js'
import THREEx from '../../Utils/Keyboard.js'
import ThirdPersonCamera from '../ThirdPersonCamera.js'
import { gsap } from "gsap";
import Shark from './Sharks.js';
import Island from './islands.js';
import Crate from './Crates.js';
import { lerp } from 'three/src/math/MathUtils.js';
import * as CANNON from 'cannon-es'
import { log } from 'three-nebula';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import Trail from './Trail.js';
import bodyTypes from '../../Utils/BodyTypes.js';

import Fishs from './Fishs.js'


export default class Boat {
  static model
  static velocity


  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.camera = this.experience.camera.instance
    this.uiManager = this.experience.uiManager
    this.physic = this.experience.physic
    this.keyboard = new THREEx.KeyboardState()
    this.uiManager.hide('.boost');



    this.resource = this.resources.items.boatModel

    this.clock = new THREE.Clock()

    this.voileAudio = new Audio('/Audios/Boat/OucertureVoile.mp3');
    this.sailingTraceAudio = new Audio('/Audios/Ambiance/navigationEau.mp3');
    this.sailingTraceAudio.volume = 0.2;
    this.voileAudio.volume = 0.5;

    this.boost = 100
    this.velocity = 200
    this.rotVelocity = 0.8

    this.boostBar = document.querySelector('.boostBar')
    this.boostProgress = document.querySelector('.boostProgress')
    this.boostBar.style.width = `${this.boost}%`
    this.boostProgress.innerHTML = `${Math.round(this.boost)}%`

    this.canUpdate = false
    this.isMoving = false
    this.voileAudioPlayed = false;
    this.distance = null
    this.rotation = null

    // Resource



    //Camera

    this.rotateAngle = new THREE.Vector3(0, 1, 0)
    this.rotateQuarternion = new THREE.Quaternion()
    this.cameraTarget = new THREE.Vector3()


    this.setModel()
    this.setKeyUp()
    this.getListener()
  }



  getListener() {

    window.addEventListener('ready', () => {

      this.canUpdate = true
      this.uiManager.fadeIn('.boost', 1);

      this.uiManager.show('.boost', false);
    })

    window.addEventListener('gameOver', () => {
      this.canUpdate = false
    })

    window.addEventListener('reset', () => {
      this.reset()
    })

  }

  remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }


  setModel() {

    this.model = this.resource.scene

    Boat.model = this.model
    // this.model.velocity = new Vector3(0, 0, 0)

    this.boatFlag1 = this.model.getObjectByName('StylShip_SailMid1_Mat_StylShip_SailsRope_0')
    this.boatFlag3 = this.model.getObjectByName('StylShip_SailMid2_Mat_StylShip_SailsRope_0')

    this.model.traverse((child) => {
      if (child.name === 'volant') {
        this.boatWheel = child
      }
    })

    const alpha = 0.5;
    const beta = 0.5;
    const gamma = 10;

    const colors = new Uint8Array(2);


    colors[0] = (0 / colors.length) * 256;
    colors[1] = (1 / colors.length) * 256;
    const format = THREE.RedFormat;
    const textureLoader = new THREE.TextureLoader();
    const gradientMap = textureLoader.load('textures/GradientMap/threeTone.jpg')
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    
    

    // basic monochromatic energy preservation
    const diffuseColor = new THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2);

    const material = new THREE.MeshToonMaterial({
      color: diffuseColor,
      gradientMap: gradientMap,

    });

    const result = threeToCannon(this.model, { type: ShapeType.BOX });

    const { shape, offset, quaternion } = result;

    this.model.body = new CANNON.Body({
      // sphereShape
      mass: 25,
      fixedRotation: true,
      linearDamping: 0.85,
      angularDamping: 0.85,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 2)),
      // collisionFilterGroup: bodyTypes.Boat,
      // collisionFilterMask: bodyTypes.Kraken | bodyTypes.OBSTACLES | bodyTypes.OTHERS,
      angularFactor: new CANNON.Vec3(0,0,0),
      isTrigger: true,

      // position: new CANNON.Vec3(miniIsland.position.x, miniIsland.position.y, miniIsland.position.z)
    });
    // this.model.body.addShape(shape, offset, quaternion);
    // this.model.body.position.set(0, 0, 0)


    this.experience.physic.world.addBody(this.model.body)

    this.childs = []

    const textures = []
    this.model.traverse((child) => {

      if (child instanceof THREE.Mesh) {
        this.childs.push(child)
        textures.push(child.material.map)
        child.material = material
      
      }
    })

    this.model.castShadow = true

    gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })

    this.model.scale.set(0.5, 0.5, 0.5)


    this.model.userData.initFloating = Math.random() * Math.PI * 2;

    this.model.rotation.y = -Math.PI / 4;


    this.scene.add(this.model)



    this.ThirdPersonCamera = new ThirdPersonCamera(
      {
        camera: this.camera,
        target: this.model,
      }

    )
    this.Shark = new Shark(
      {
        boat: this.model,
        canUpdate: this.canUpdate,

      }
    )
    this.island = new Island(
      {
        boat: this.model,
      }
    )

    this.crate = new Crate(
      {
        boat: this.model,
      }
    )

    this.Fishs = new Fishs(
      {
        boat: this.model,
      }
    )

    this.trail = new Trail(
      {
        boat: this.model,
      }
    )

    this.trail.particleGroup.visible = false;




  }
  stop() {
    if (this.model) {
      this.distance = 0
      this.rotation = 0
    }
  }




  setKeyUp() {
    this.isKeyUp = false;

    window.addEventListener('keyup', (event) => {
      this.stop()
      // lerp volume to 0
      this.isKeyUp = true;
      this.isMoving = false;


      if (event.key === 'Shift') {
        this.voileAudioPlayed = false;
        gsap.to(this.boatFlag1.scale, { x: 1, y: -0.1, z: 1, duration: 1, easing: "easeOut" })
        gsap.to(this.boatFlag3.scale, { x: 1, y: -0.1, z: 1, duration: 1, easing: "easeOut" })
        this.model.body.angularVelocity.set(0, 0, 0); // Cela va arrêter toute rotation sur tous les axes
        this.trail.particleGroup.visible = false;
        // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      }
      else if (event.key === 'ArrowLeft' || event.key === 'q') {
        this.model.body.angularVelocity.set(0, 0, 0); // Cela va arrêter toute rotation sur tous les axes


      }
      else if (event.key === 'ArrowRight' || event.key === 'd') {
        this.model.body.angularVelocity.set(0, 0, 0); // Cela va arrêter toute rotation sur tous les axes


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

    }
  }
  boostManager() {


    if (this.boost <= 0) {
      // this.ThirdPersonCamera.speed = 0.04
      this.velocity = 200
      // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })


    }
    else {
      // this.ThirdPersonCamera.speed = 0.2
      this.velocity = 500
    }
  }

  updateSpeed() {
    if (this.model) {
      this.model.rotation.y += this.rotation
      // this.model.body.velocity.z = this.distance * Math.sin(this.model.rotation.y)

    }
  }


  boatControls() {
    this.delta = this.clock.getDelta()




    let topPoint = new THREE.Vector3(0, 0, 0)

    let forceMagnitude = 200;
    let torque;
    let rotationSpeed = 0.6;

    // Obtenir l'orientation actuelle du bateau en THREE.js
    const quaternion = new THREE.Quaternion().copy(this.model.body.quaternion);

    // Obtenir la direction avant du bateau basée sur son orientation
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();
    let impulse = new CANNON.Vec3(forward.x, forward.y, forward.z);
    if (this.canUpdate) {
      if (this.keyboard.pressed('left') || this.keyboard.pressed('q')) {

        torque = new CANNON.Vec3(0, forceMagnitude, 0); // Modifier la direction et la magnitude du couple selon vos besoins
        // this.model.body.applyTorque(torque);
        this.rotation = this.rotVelocity * this.delta
        this.boatWheel.rotation.z += this.delta * rotationSpeed


      }
      if (this.keyboard.pressed('right') || this.keyboard.pressed('d')) {
        torque = new CANNON.Vec3(0, -forceMagnitude, 0); // Modifier la direction et la magnitude du couple selon vos besoins
        // this.model.body.applyTorque(torque);
        this.boatWheel.rotation.z -= this.delta * rotationSpeed
        this.rotation = -this.rotVelocity * this.delta

      }
      if (this.keyboard.pressed('up') || this.keyboard.pressed('z')) {

        this.distance = this.velocity * this.delta

        impulse.scale(this.distance, impulse);

        // Appliquer l'impulsion à partir du point supérieur pour faire avancer le bateau
        this.model.body.applyImpulse(impulse, topPoint);
        this.isKeyUp = false;
        this.isMoving = true;
        this.sailingTraceAudio.play();
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0.2, 0.1);
      }
      if (this.keyboard.pressed('down') || this.keyboard.pressed('s')) {
        this.distance = -this.velocity * this.delta
        impulse.scale(this.distance / 2, impulse);
        // Appliquer l'impulsion à partir du point supérieur pour faire avancer le bateau
        this.model.body.applyImpulse(impulse, topPoint);
        this.isKeyUp = false;
        this.isMoving = true;
        this.sailingTraceAudio.play();
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0.2, 0.1);
      }

      if (this.keyboard.pressed('shift')) {
        this.boostManager()
        this.unfillBoost()
        if (this.boost > 0) {
          if (!this.voileAudioPlayed) {
            this.voileAudio.play();
            this.voileAudioPlayed = true;
            this.trail.particleGroup.visible = true;
          }

          gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
          gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
          // gsap.to(this.particleGroup.scale, { x: 2, y: 3.5, z: 8, duration: 3, ease: "easeOut" })

        }

        // console.log("shift pressed");

      } else {
        this.velocity = 200
        this.fillBoost()
      }

    }
  }


  update() {

    this.updateSpeed()
    this.boatControls()
    const elapsedTime = this.time.elapsed * 0.0008
    const delta = this.clock.getDelta()
    if (this.model) {

      this.ThirdPersonCamera.update(this.time.delta)

      this.Fishs.update(this.time.delta)
      if (this.canUpdate) {

        // this.Shark.update(this.time.delta)
        this.island.update(this.time.delta)
        this.crate.update(this.time.delta)
        this.trail.update(this.time.delta)

      }
      if (!this.isMoving) {
        this.model.body.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.04;
        this.model.rotation.z = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.03;
      }
      if (this.isKeyUp) {
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0, 0.1);

      }
      this.model.position.copy(this.model.body.position)
      // this.model.quaternion.copy(this.model.body.quaternion)
      this.model.body.quaternion.copy(this.model.quaternion)

    }

  }

  reset() {

    this.boost = 100

    this.canUpdate = false
    this.sailingTraceAudio.volume = 0.2;
    this.voileAudio.volume = 0.5;
    // Resource

    this.distance = null
    this.rotation = null

    this.velocity = 200
    this.boost = 100
    this.rotVelocity = 0.8
    this.voileAudioPlayed = false;
    this.trail.particleGroup.visible = false;
    this.isKeyUp = true;
    this.isMoving = false;

    //Camera

    this.rotateAngle = new THREE.Vector3(0, 1, 0)
    this.rotateQuarternion = new THREE.Quaternion()
    this.cameraTarget = new THREE.Vector3()

    gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })
    // boatPlane.visible = false
    this.model.scale.set(0.5, 0.5, 0.5)
    // this.model.position.set(0, 6, 0) :// check in ThrdPeson cam
    this.model.position.x = 0
    // this.model.position.y = Math.random() * Math.PI * 2;:::
    this.model.position.z = 0
    this.model.userData.initFloating = Math.random() * Math.PI * 2;

    this.model.rotation.y = Math.PI;
    // reset body position
    this.model.body.position.set(0, 0, 0)
    this.model.body.quaternion = new CANNON.Quaternion(0, 0, 0, 1)

  }
}

