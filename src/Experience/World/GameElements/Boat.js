
import * as THREE from 'three'

import Experience from '../../Experience.js'
import THREEx from '../../Utils/keyboard.js'
import ThirdPersonCamera from '../ThirdPersonCamera.js'
import { gsap } from "gsap";
import Shark from './Sharks.js';
import Island from './Islands.js';
import Crate from './Crates.js';
import Trail from './Trail.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RadialBlurPassGen } from 'three-radial-blur';
import fragmentToonShader from './../../../../static/shaders/Boat/fragmentToonShader.glsl';
import vertexToonShader from './../../../../static/shaders/Boat/vertexToonShader.glsl';
import BirdMove from './BirdMove.js'
import Kraken from './Kraken.js'
import Boost from './Boost.js';


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
    this.birdsPlane = this.resources.items.birdsPlane

    this.clock = new THREE.Clock()

    this.voileAudio = new Audio('/Audios/Boat/OucertureVoile.mp3');
    this.sailingTraceAudio = new Audio('/Audios/Ambiance/navigationEau.mp3');
    this.gameOverAudio = new Audio('/Audios/Ambiance/gameOver.mp3');
    this.gameOverAudio.volume = 0.3;
    this.sailingTraceAudio.volume = 0.2;
    this.voileAudio.volume = 0.5;

    this.boost = 100
    this.rotVelocity = 0.0006
    this.velocity = 0.004
    this.rotation = null
    this.boostMultiplier = 2;
    this.boostElement = new Boost(this.scene)
    // this.boostBar = document.querySelector('.boostBar')
    // this.boostProgress = document.querySelector('.boostProgress')
    // this.boostBar.style.width = `${this.boost}%`
    // this.boostProgress.innerHTML = `${Math.round(this.boost)}%`

    window.canUpdate = false
    this.isMoving = false
    this.voileAudioPlayed = false;
    this.distance = null
    this.rotation = null
    this.canPlayGameOVer = true



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

      window.canUpdate = true
      this.uiManager.fadeIn('.boost', 1);

      this.uiManager.show('.boost', false);
    })

    window.addEventListener('gameOver', () => {
      if (this.canPlayGameOVer) {
        this.gameOverAudio.play();
        this.canPlayGameOVer = false
      }
      window.canUpdate = false
    })

    window.addEventListener('reset', () => {
      this.reset()
    })

    window.addEventListener('startExp', () => {


      // gsap.to(this.model.rotation, { y: -Math.PI / 2, duration: 1, ease: "easeOut" })
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
    this.model.rotation.y = Math.PI / 2;

    this.model.children[4].geometry.computeBoundingBox()
    this.model.userData.initFloating = Math.random() * Math.PI * 2;

    // this.model.rotation.y = -Math.PI / 4;

    this.scene.add(this.model)
    this.setupAdditionalComponents()
  }

  setupAdditionalComponents() {

    this.ThirdPersonCamera = new ThirdPersonCamera({ camera: this.camera, target: this.model, canUpdate: window.canUpdate })
    this.Shark = new Shark({ boat: this.model, canUpdate: window.canUpdate })
    this.island = new Island({ boat: this.model })
    this.crate = new Crate({ boat: this.model })
    this.kraken = new Kraken({ boat: this.model, canUpdate: window.canUpdate })
    this.trail = new Trail({ boat: this.model })
    this.trail.particleGroup.visible = false;
    this.birdMove1 = new BirdMove(this.scene, this.birdsPlane);
    this.birdMove1.setPosition(0, 0, 0)
    this.birdMove2 = new BirdMove(this.scene, this.birdsPlane);
    this.birdMove2.setPosition(50, 0, 0)
    this.birdMove3 = new BirdMove(this.scene, this.birdsPlane);
    this.birdMove3.setPosition(-50, 0, 0)
    this.birdMove4 = new BirdMove(this.scene, this.birdsPlane);
    this.birdMove4.setPosition(0, 0, 50)
    this.birdMove5 = new BirdMove(this.scene, this.birdsPlane);
    this.birdMove5.setPosition(0, 0, -50)

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

        this.trail.particleGroup.visible = false;
        // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      }
      else if (event.key === 'ArrowLeft' || event.key === 'q') {


      }
      else if (event.key === 'ArrowRight' || event.key === 'd') {

      }
    })

  }

  fillBoost() {

    if (this.boost >= 100) return
    this.boost += 0.085

    // this.boostBar.style.width = `${this.boost}%`
    // this.boostProgress.innerHTML = `${Math.round(this.boost)}%`
    // console.log(this.boost + "can fill");
  }

  unfillBoost() {
    if (this.boost > 0) {
      this.boost -= 0.15
      // this.boostBar.style.width = `${this.boost}%`
      // this.boostProgress.innerHTML = `${Math.round(this.boost)}%`

    }
  }
  boostManager() {


    if (this.boost <= 0) {
      // this.ThirdPersonCamera.speed = 0.04

      this.boostMultiplier = 1
      // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, easing: "easeOut" })


    }
    else {
      // this.ThirdPersonCamera.speed = 0.2
      this.boostMultiplier = 1.8
    }
  }

  updateSpeed() {
    if (this.model && window.canUpdate) {
      this.model.rotation.y += this.rotation
      this.model.translateZ(this.distance)


    }
  }


  boatControls() {
    let rotationSpeed = 0.05;
    // Rotation du bateau
    if (this.keyboard.pressed('left') || this.keyboard.pressed('q')) {
      this.rotation = this.rotVelocity * this.time.delta;
      this.boatWheel.rotation.z += this.time.delta * rotationSpeed * 0.05;
    } else if (this.keyboard.pressed('right') || this.keyboard.pressed('d')) {
      this.rotation = -this.rotVelocity * this.time.delta;
      this.boatWheel.rotation.z -= this.time.delta * rotationSpeed * 0.05;
    }

    // Mouvement avant et arrière
    if (this.keyboard.pressed('up') || this.keyboard.pressed('z')) {
      this.distance = this.velocity * this.time.delta;
      this.isMoving = true;
      this.sailingTraceAudio.play();
      this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0.2, 0.1);
    } else if (this.keyboard.pressed('down') || this.keyboard.pressed('s')) {
      this.distance = (-this.velocity / 2) * this.time.delta;
      this.isMoving = true;
      this.sailingTraceAudio.play();
      this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0.2, 0.1);
    }

    // Gestion du boost
    if (this.keyboard.pressed('shift') && this.boost > 0) {
      // calculate distance with boost multiplier
      this.distance = this.velocity * this.boostMultiplier * this.time.delta;
      this.boostManager();
      this.unfillBoost();

      // Effets visuels et sonores pour le boost
      if (!this.voileAudioPlayed) {
        this.voileAudio.play();
        this.voileAudioPlayed = true;
        this.trail.particleGroup.visible = true;
      }
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" });
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" });
    } else {

      this.boostMultiplier = 1;
      this.fillBoost();
    }

  }


  update() {

    this.updateSpeed()
    this.boatControls()
    const elapsedTime = this.time.elapsed * 0.0008
    const delta = this.clock.getDelta()

    if (this.model) {


      this.updateAdditionalComponents()


      this.model.rotation.z = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.05;

      if (this.isKeyUp) {
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0, 0.1);

      }


    }
  }



  updateAdditionalComponents() {
    this.ThirdPersonCamera.update(this.time.delta)

    this.kraken.update(this.time.delta)
    this.island.update(this.time.delta)
    this.birdMove1.update(this.time.delta)
    this.birdMove2.update(this.time.delta)
    this.birdMove3.update(this.time.delta)
    this.birdMove4.update(this.time.delta)
    this.birdMove5.update(this.time.delta)
    this.boostElement.update(this.time.delta)
    if (window.canUpdate) {
      this.Shark.update(this.time.delta)
      this.crate.update(this.time.delta)
      this.trail.update(this.time.delta)
    }
  }

  reset() {

    this.boost = 100
    // this.boostBar.style.width = `${this.boost}%`
    // this.boostProgress.innerHTML = `${Math.round(this.boost)}%`
    this.canPlayGameOVer = true

    window.canUpdate = false
    this.sailingTraceAudio.volume = 0.2;
    this.voileAudio.volume = 0.5;
    // Resource

    this.distance = null
    this.rotation = null


    this.boostMultiplier = 1
    this.boost = 100
    this.rotVelocity = 0.0006
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


  }
}