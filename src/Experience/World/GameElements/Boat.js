
import * as THREE from 'three'

import Experience from '../../Experience.js'
import THREEx from '../../Utils/keyboard.js'
import ThirdPersonCamera from '../ThirdPersonCamera.js'
import { gsap } from "gsap";
import Shark from './Sharks.js';
import Island from './Islands.js';
import Crate from './Crates.js';
import Trail from './Trail.js';
import fragmentToonShader from './../../../../static/shaders/Boat/fragmentToonShader.glsl';
import vertexToonShader from './../../../../static/shaders/Boat/vertexToonShader.glsl';
import BirdMove from './BirdMove.js'
import Kraken from './Kraken.js'
import Boost from './Boost.js';

const BOAT_PHYSICS = {
  rotationSpeed: 0.001,
  maxRotationSpeed: 0.001,
  rotationAcceleration: 0.001,
  rotationDamping: 0.95,
  maxSpeed: null,
  acceleration: 0.008,
  reverseAcceleration: 0.003,
  waterResistance: 0.98,
  minMovementThreshold: 0.01,
  maxTiltAngle: 0.15
};


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
    this.uiManager = this.experience.uiManager
    this.physic = this.experience.physic
    this.keyboard = new THREEx.KeyboardState()
    this.uiManager.hide('.boost');
    this.outlinePass = this.experience.renderer.outlinePass



    this.resource = this.resources.items.boatModel
    this.birdsPlane = this.resources.items.birdsPlane
    this.voileAudio = new Audio('/Audios/Boat/OucertureVoile.mp3');
    this.sailingTraceAudio = new Audio('/Audios/Ambiance/navigationEau.mp3');
    this.gameOverAudio = new Audio('/Audios/Ambiance/gameOver.mp3');
    this.gameOverAudio.volume = 0.3;
    this.sailingTraceAudio.volume = 0.2;
    this.sailingTraceAudio.loop = true;
    this.voileAudio.volume = 0.5;

    this.boost = 100
    this.rotVelocity = 0.0006
    this.velocity = 0.004
    this.rotation = 0
    this.boostMultiplier = 1;
    this.boostElement = new Boost(this.scene)
    window.canUpdate = false
    this.isMoving = false
    this.voileAudioPlayed = false;
    this.isBoostDown = false
    this.canFillBoost = false
    this.canBoost = true
    this.distance = 0
    this.rotation = null
    this.canPlayGameOVer = true
    this.rotationVelocity = 0;
    this.currentSpeed = 0;


    this.rotateAngle = new THREE.Vector3(0, 1, 0)
    this.rotateQuarternion = new THREE.Quaternion()
    this.cameraTarget = new THREE.Vector3()

    this.setModel()
    this.setKeyUp()
    this.getListener()

  }



  getListener() {

    this.onReady = () => {
      window.canUpdate = true
      this.uiManager.fadeIn('.boost', 1);
      this.uiManager.show('.boost', false);
    }

    this.onGameOver = () => {
      if (this.canPlayGameOVer) {
        this.gameOverAudio.play();
        this.canPlayGameOVer = false
      }
      window.canUpdate = false
    }
    this.onReset = () => {
      this.reset()
    }

    window.addEventListener('ready', this.onReady)
    window.addEventListener('gameOver', this.onGameOver)
    window.addEventListener('reset', this.onReset)
  }





  setModel() {

    this.model = this.resource.scene

    Boat.model = this.model
    // this.model.velocity = new Vector3(0, 0, 0)
    this.model.position.z = 5
    


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
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexToonShader,
      fragmentShader: fragmentToonShader,
      uniforms: {

      },

    })



    this.childs = []

    const textures = []
    const boatSelectedObjects = []
    this.model.traverse((child) => {

      if (child instanceof THREE.Mesh) {
        this.childs.push(child)
        textures.push(child.material.map)
        child.material = material
        boatSelectedObjects.push(child)
        this.outlinePass.selectedObjects = boatSelectedObjects

      }
    })


    this.model.castShadow = true

    gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })

    this.model.scale.set(0.5, 0.5, 0.5)
    this.model.rotation.y = Math.PI / 2;

    this.model.children[4].geometry.computeBoundingBox()
    this.model.userData.initFloating = Math.random() * Math.PI * 2;
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
    // this.trail.particleGroup.visible = false;
    this.trail.particleGroup.scale.set(0, 0, 0)

    this.birds = [
      new BirdMove(this.scene, this.birdsPlane),
      new BirdMove(this.scene, this.birdsPlane),
      new BirdMove(this.scene, this.birdsPlane),
      new BirdMove(this.scene, this.birdsPlane),
      new BirdMove(this.scene, this.birdsPlane),
    ]
    this.birds.forEach((bird, index) => {
      bird.position = new THREE.Vector3(Math.random() * 100 - 50, Math.random() * 10 + 5, Math.random() * 100 - 50)
      bird.rotation = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    })

  }

  stop() {
    if (this.model) {
      // this.distance = 0
      this.rotation = 0
    }
  }




  setKeyUp() {
    this.isKeyUp = false;

    window.addEventListener('keyup', (event) => {
      this.stop()

      this.isKeyUp = true;
      this.isMoving = false;


      if (event.key === 'Shift') {
        this.voileAudioPlayed = false;

        gsap.to(this.boatFlag1.scale, { x: 1, y: -0.1, z: 1, duration: 1, easing: "easeOut" })
        gsap.to(this.boatFlag3.scale, { x: 1, y: -0.1, z: 1, duration: 1, easing: "easeOut" })

        this.trail.hideParticle()
        this.isBoostDown = false
        this.canFillBoost = true


      }
      else if (event.key === 'ArrowLeft' || event.key === 'q') {

        this.resetRotation()
        console.log('left');

      }
      else if (event.key === 'ArrowRight' || event.key === 'd') {
        this.resetRotation()
        console.log('right');
      }
    })

  }

  fillBoost() {

    if (this.boost >= 100) return
    this.boost += 0.085
  }

  unfillBoost() {
    if (this.boost > 0) {
      this.boost -= 0.15

    }
  }


  updateSpeed() {
    if (this.model && window.canUpdate) {
      this.model.rotation.y += this.rotation
      const angle = this.model.rotation.y
      const moveX = Math.sin(angle) * this.distance
      const moveZ = Math.cos(angle) * this.distance
      this.model.position.x += moveX
      this.model.position.z += moveZ





    }
  }

  boatControls() {
    // Définir maxSpeed basé sur la propriété de l'instance
    BOAT_PHYSICS.maxSpeed = this.velocity;

    // Gestion de la rotation
    this.handleRotation();

    // Gestion du mouvement avant/arrière
    this.handleMovement();

    // Calcul final de la distance
    this.distance = this.currentSpeed * this.time.delta;

    // Gestion du boost
    this.handleBoost();
  }

  // Gestion de la rotation du bateau
  handleRotation() {
    let isTurning = false;
    if (this.keyboard.pressed('left') || this.keyboard.pressed('q')) {
      this.rotateLeft();

      this.model.rotation.z = THREE.MathUtils.lerp(
        this.model.rotation.z,
        -BOAT_PHYSICS.maxTiltAngle,
        0.1
      );
      isTurning = true;
    } else if (this.keyboard.pressed('right') || this.keyboard.pressed('d')) {
      this.rotateRight();
      this.model.rotation.z = THREE.MathUtils.lerp(
        this.model.rotation.z,
        BOAT_PHYSICS.maxTiltAngle,
        0.1
      );
      isTurning = true;
    }

    if (!isTurning) {
      this.resetRotation();
      this.model.rotation.z = THREE.MathUtils.lerp(
        this.model.rotation.z,
        0,
        0.1
      );


    }

    // Appliquer la rotation calculée
    this.rotation = this.rotationVelocity * this.time.delta;


  }

  // Rotation vers la gauche
  rotateLeft() {
    this.rotationVelocity = THREE.MathUtils.clamp(
      this.rotationVelocity + BOAT_PHYSICS.rotationAcceleration * this.time.delta,
      -BOAT_PHYSICS.maxRotationSpeed,
      BOAT_PHYSICS.maxRotationSpeed
    );

    // Animation du gouvernail
    const targetWheelRotation = 0.8;
    this.boatWheel.rotation.z = THREE.MathUtils.lerp(
      this.boatWheel.rotation.z,
      targetWheelRotation,
      BOAT_PHYSICS.rotationSpeed * this.time.delta
    );
  }

  // Rotation vers la droite
  rotateRight() {
    this.rotationVelocity = THREE.MathUtils.clamp(
      this.rotationVelocity - BOAT_PHYSICS.rotationAcceleration * this.time.delta,
      -BOAT_PHYSICS.maxRotationSpeed,
      BOAT_PHYSICS.maxRotationSpeed
    );

    // Animation du gouvernail
    const targetWheelRotation = -0.8;
    this.boatWheel.rotation.z = THREE.MathUtils.lerp(
      this.boatWheel.rotation.z,
      targetWheelRotation,
      BOAT_PHYSICS.rotationSpeed * this.time.delta
    );
  }


  // Remise à zéro progressive de la rotation
  resetRotation() {

    this.boatWheel.rotation.z = THREE.MathUtils.lerp(
      this.boatWheel.rotation.z,
      0,
      BOAT_PHYSICS.rotationSpeed * this.time.delta * 0.5
    );


    // Diminution progressive de la vitesse de rotation
    this.rotationVelocity *= BOAT_PHYSICS.rotationDamping;

  }

  // Gestion du mouvement avant/arrière
  handleMovement() {
    if (this.keyboard.pressed('up') || this.keyboard.pressed('z')) {
      this.moveForward();
    } else if (this.keyboard.pressed('down') || this.keyboard.pressed('s')) {
      this.moveBackward();
    } else {
      this.slowDown();
    }
  }

  // Mouvement vers l'avant
  moveForward() {
    this.currentSpeed = THREE.MathUtils.lerp(
      this.currentSpeed,
      BOAT_PHYSICS.maxSpeed * this.boostMultiplier,
      BOAT_PHYSICS.acceleration * this.time.delta
    );

    this.isMoving = true;
    this.playSailingSound(0.2);
  }

  // Mouvement vers l'arrière
  moveBackward() {
    this.currentSpeed = THREE.MathUtils.lerp(
      this.currentSpeed,
      -BOAT_PHYSICS.maxSpeed / 2,
      BOAT_PHYSICS.reverseAcceleration * this.time.delta
    );

    this.isMoving = true;
    this.playSailingSound(0.2);
  }

  // Ralentissement naturel
  slowDown() {
    this.currentSpeed *= BOAT_PHYSICS.waterResistance;


  }

  // Gestion des sons du bateau
  playSailingSound(targetVolume) {
    if (!this.sailingTraceAudio.playing) {
      this.sailingTraceAudio.play();
    }
    this.sailingTraceAudio.volume = THREE.MathUtils.lerp(
      this.sailingTraceAudio.volume,
      targetVolume,
      0.1
    );
  }

  stopSailingSound() {
    if (this.sailingTraceAudio.playing && this.sailingTraceAudio.volume < 0.05) {
      this.sailingTraceAudio.pause();
    } else if (this.sailingTraceAudio.playing) {
      this.sailingTraceAudio.volume *= 0.95;
    }
  }

  // Gestion du boost
  handleBoost() {
    if (this.keyboard.pressed('shift') && this.boost > 0) {
      this.onShiftPressed();
    } else {
      this.resetBoost();
    }

    this.handleEmptyBoost();
  }

  // Méthode pour gérer le reset du boost
  resetBoost() {
    this.boostMultiplier = 1;
    this.canBoost = true;
    if (this.canFillBoost) {
      this.fillBoost();
    }
  }

  // Méthode pour gérer le cas où le boost est vide
  handleEmptyBoost() {
    if (this.boost <= 0 && !this.isBoostDown) {
      this.isBoostDown = true;
      this.boostMultiplier = 1;
      this.animateFlagsDown();
    }
  }

  // Animation des drapeaux qui tombent
  animateFlagsDown() {
    gsap.to(this.boatFlag1.scale, {
      x: 1,
      y: -0.1,
      z: 1,
      duration: 1,
      easing: "easeOut"
    });
    gsap.to(this.boatFlag3.scale, {
      x: 1,
      y: -0.1,
      z: 1,
      duration: 1,
      easing: "easeOut"
    });
  }

  onShiftPressed() {
    if (!this.isBoostDown) {
      this.boostMultiplier = 1.8
      this.unfillBoost();
    }
    // Effets visuels et sonores pour le boost
    if (!this.voileAudioPlayed) {
      this.voileAudio.play();
      this.voileAudioPlayed = true;
      this.trail.showParticle()
    }
    if (this.canBoost) {
      this.canBoost = false
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" });
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" });

    }
  }




  update() {

    this.updateSpeed()
    this.boatControls()
    const elapsedTime = this.time.elapsed * 0.0008

    if (this.model) {
      this.updateAdditionalComponents()
      if (!this.isMoving) {
        this.model.rotation.z = THREE.MathUtils.lerp(this.model.rotation.z,
          Math.sin(this.model.userData.initFloating + elapsedTime) * 0.05, 0.1);
      }
      if (this.isKeyUp) {
        this.sailingTraceAudio.volume = THREE.MathUtils.lerp(this.sailingTraceAudio.volume, 0, 1);
      }
    }
  }



  updateAdditionalComponents() {
    this.ThirdPersonCamera.update(this.time.delta)

    this.kraken.update(this.time.delta)
    this.island.update(this.time.delta)
    this.birds.forEach(bird => bird.update(this.time.delta));
    this.boostElement.update(this.time.delta)
    if (window.canUpdate) {
      // this.Shark.update(this.time.delta)
      this.crate.update(this.time.delta)
      this.trail.update(this.time.delta)

    }
  }

  reset() {

    this.boost = 100
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
    // this.trail.particleGroup.visible = false;
    this.trail.hideParticle()
    this.isBoostDown = false
    this.isKeyUp = true;
    this.isMoving = false;
    this.canBoost = true

    //Camera

    this.rotateAngle = new THREE.Vector3(0, 1, 0)
    this.rotateQuarternion = new THREE.Quaternion()
    this.cameraTarget = new THREE.Vector3()

    gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })

    this.model.scale.set(0.5, 0.5, 0.5)
    // this.model.position.set(0, 6, 0) :// check in ThrdPeson cam
    this.model.position.x = 0
    // this.model.position.y = Math.random() * Math.PI * 2;
    this.model.position.z = 5
    this.model.userData.initFloating = Math.random() * Math.PI * 2;

    this.model.rotation.y = Math.PI;
    this.getListener()

    window.removeEventListener('ready', this.onReady)
    window.removeEventListener('gameOver', this.onGameOver)
    window.removeEventListener('reset', this.onReset)
  }
}