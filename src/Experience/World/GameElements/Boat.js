
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
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RadialBlurPassGen } from 'three-radial-blur';
import fragmentToonShader from './../../../../static/shaders/Boat/fragmentToonShader.glsl';
import vertexToonShader from './../../../../static/shaders/Boat/vertexToonShader.glsl';



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
    this.renderer = this.experience.renderer.instance
    this.composer = this.experience.renderer.composer
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
    this.velocity = 10
    this.rotVelocity = 0.00

    this.boostBar = document.querySelector('.boostBar')
    this.boostProgress = document.querySelector('.boostProgress')
    this.boostBar.style.width = `${this.boost}%`
    this.boostProgress.innerHTML = `${Math.round(this.boost)}%`

    this.canUpdate = false
    this.isMoving = false
    this.voileAudioPlayed = false;
    this.distance = null
    this.rotation = null




    //Camera

    this.rotateAngle = new THREE.Vector3(0, 1, 0)
    this.rotateQuarternion = new THREE.Quaternion()
    this.cameraTarget = new THREE.Vector3()


    this.setModel()
    this.setKeyUp()
    this.getListener()
    // this.activeBlur()
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

  activeBlur() {


    const RadialBlurPass = RadialBlurPassGen({ THREE, Pass, FullScreenQuad })

    this.radialBlur = new RadialBlurPass({
      intensity: 0.0, // normalize blur distance; 0. to 1.
      iterations: 7, // total steps along blur distance
      maxIterations: 100, // max. iterations ( immutable after creation ) 
      radialCenter: new THREE.Vector2() // radial center; -1. to 1.
    })

    this.composer.addPass(this.radialBlur);
    this.radialBlur.renderToScreen = true;


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

    const textureLoader = new THREE.TextureLoader();
    const gradientMap = textureLoader.load('textures/GradientMap/threeTone.jpg')
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    // basic monochromatic energy preservation
    const diffuseColor = new THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2);

    // const material = new THREE.MeshToonMaterial({
    //   color: diffuseColor,
    //   gradientMap: gradientMap,

    // });

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexToonShader,
      fragmentShader: fragmentToonShader,
      uniforms: {

      },
      
    })

    const result = threeToCannon(this.model, { type: ShapeType.BOX });

    const { shape, offset, quaternion } = result;

    this.model.body = new CANNON.Body({
      // sphereShape
      mass: 35,
      fixedRotation: true,
      linearDamping: 0.85,
      // angularDamping: 0.85,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 2)),
      type: CANNON.Body.DYNAMIC,

    });
    // this.model.body.addShape(shape, offset, quaternion);
    // this.model.body.position.set(0, 0, 0)
    const groundMaterial = new CANNON.Material('groundMaterial');

    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    groundBody.material = groundMaterial;
    groundMaterial.friction = 0.1;
    groundBody.quaternion.setFromEuler(new CANNON.Vec3(-Math.PI / 2, 0, 0));
    groundBody.position.set(0, 1, 0);
    this.experience.physic.world.addBody(groundBody);

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

    // this.model.rotation.y = -Math.PI / 4;

    this.scene.add(this.model)
    this.setupAdditionalComponents()
  }

  setupAdditionalComponents() {

    this.ThirdPersonCamera = new ThirdPersonCamera({ camera: this.camera, target: this.model })
    this.Shark = new Shark({ boat: this.model, canUpdate: this.canUpdate })
    this.island = new Island({ boat: this.model })
    this.crate = new Crate({ boat: this.model })
    this.Fishs = new Fishs({ boat: this.model })
    this.trail = new Trail({ boat: this.model })
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
        // gsap.to(this.radialBlur, { intensity: 0, duration: 1, ease: "easeOut" })
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
      this.velocity = 20
      // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })


    }
    else {
      // this.ThirdPersonCamera.speed = 0.2
      this.velocity = 40
    }
  }

  updateSpeed() {
    if (this.model) {
      this.model.rotation.y += this.rotation
      // this.model.body.velocity.z = this.distance * Math.sin(this.model.rotation.y)

    }
  }


  boatControls() {

    // Définition des variables de point supérieur et de vitesse de rotation
    let topPoint = new THREE.Vector3(0, 0, 0);
    let rotationSpeed = 0.002;

    // Copie l'orientation actuelle du modèle du bateau en tant que quaternion
    const quaternion = new THREE.Quaternion().copy(this.model.body.quaternion);

    // Calcule la direction avant du bateau basée sur son orientation
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();

    // Convertit la direction avant en vecteur compatible avec CANNON.js
    let force = new CANNON.Vec3(forward.x, forward.y, forward.z);

    if (this.canUpdate) {

      if (this.keyboard.pressed('left') || this.keyboard.pressed('q')) {
        this.model.body.angularVelocity.set(0, 1 * 0.05 * this.time.delta, 0);
        this.boatWheel.rotation.z += this.time.delta * rotationSpeed

      } else if (this.keyboard.pressed('right') || this.keyboard.pressed('d')) {
        this.model.body.angularVelocity.set(0, -1 * 0.05 * this.time.delta, 0);
        this.boatWheel.rotation.z -= this.time.delta * rotationSpeed
      }
      if (this.keyboard.pressed('up') || this.keyboard.pressed('z')) {

        this.distance = this.velocity * this.time.delta

        this.model.body.applyForce(force.scale(this.distance), force)
        this.isKeyUp = false;
        this.isMoving = true;
        this.sailingTraceAudio.play();
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0.2, 0.1);
      }
      if (this.keyboard.pressed('down') || this.keyboard.pressed('s')) {
        this.distance = -this.velocity * this.time.delta
        this.model.body.applyForce(force.scale(this.distance / 2))
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
            // gsap.to(this.radialBlur, { intensity: 0.05, duration: 1, ease: "easeOut" })
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
        this.velocity = 20
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


      this.updateAdditionalComponents()

      if (!this.isMoving) {
        this.model.body.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.04;
        this.model.rotation.z = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.03;
      }
      if (this.isKeyUp) {
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0, 0.1);

      }
      this.model.position.copy(this.model.body.position)
      this.model.quaternion.copy(this.model.body.quaternion)

    }
  }



  updateAdditionalComponents() {
    this.ThirdPersonCamera.update(this.time.delta)

    this.Fishs.update(this.time.delta)
    if (this.canUpdate) {
      this.Shark.update(this.time.delta)
      this.island.update(this.time.delta)
      this.crate.update(this.time.delta)
      this.trail.update(this.time.delta)
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

    this.velocity = 20
    this.boost = 100
    this.rotVelocity = 0.8
    this.voileAudioPlayed = false;
    this.trail.particleGroup.visible = false;
    this.isKeyUp = true;
    this.isMoving = false;
    // this.radialBlur.intensity = 0

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