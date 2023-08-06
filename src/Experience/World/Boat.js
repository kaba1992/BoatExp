
import * as THREE from 'three'

import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import { gsap } from "gsap";
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color, log } from "three-nebula"
import hyperlapsFragment from '../../../static/shaders/Boat/hyperlapsFragment.glsl'
import hyperlapsVertex from '../../../static/shaders/Boat/hyperlapsVertex.glsl'
import toonVertex from '../../../static/shaders/Boat/toonVertex.glsl'
import toonFragment from '../../../static/shaders/Boat/toonFragment.glsl'
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
    this.size = this.experience.sizes
    this.keyboard = new THREEx.KeyboardState()
    this.boost = 100
    this.physic = this.experience.physic
    this.boostBar = document.querySelector('.boostBar')
    this.boostProgress = document.querySelector('.boostProgress')
    this.boostProgress.innerHTML = `${this.boost}%`
    this.clock = new THREE.Clock()

    // Resource
    this.resource = this.resources.items.boatModel

    this.setModel()
    this.setKeyUp()
    this.setParticle()
    this.setHyperLaps()

  }




  setHyperLaps() {
    this.hyperlapsMaterial = new THREE.ShaderMaterial({
      vertexShader: hyperlapsVertex,
      fragmentShader: hyperlapsFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.size.width, this.size.height) },
        uNoiseTexture: { value: this.experience.renderer.renderTexture.texture },
      },
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      depthTest: false,
      renderOrder: 10,
    })
    this.hyperlapsPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.hyperlapsMaterial)
    // this.scene.add(this.hyperlapsPlane)
    this.camera.add(this.hyperlapsPlane)
    this.hyperlapsPlane.visible = false

  }


  setModel() {

    this.model = this.resource.scene

    Boat.model = this.model
    // this.model.velocity = new Vector3(0, 0, 0)

    this.boatFlag1 = this.model.getObjectByName('StylShip_SailMid1_Mat_StylShip_SailsRope_0')
    this.boatFlag3 = this.model.getObjectByName('StylShip_SailMid2_Mat_StylShip_SailsRope_0')

    // this.boatToonMaterial = new THREE.ShaderMaterial({
    //   vertexShader: toonVertex,
    //   fragmentShader: toonFragment,
    //   lights: true,
    //   uniforms: {
    //     ...THREE.UniformsLib.lights,
    //     // green: { value: new THREE.Color('#00FF00') },
    //     uColor: { value: new THREE.Color('#409851') },
    //     uGlossiness: { value: 2 }

    //   },

    // })
    const alpha = 0.5;
    const beta = 0.5;
    const gamma = 0.5;

    const colors = new Uint8Array(2);


    colors[0] = (0 / colors.length) * 256;
    colors[1] = (1 / colors.length) * 256;
    const format = THREE.RedFormat;
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
    gradientMap.needsUpdate = true;

    // basic monochromatic energy preservation
    const diffuseColor = new THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2);

    const material = new THREE.MeshToonMaterial({
      color: diffuseColor,
      gradientMap: gradientMap
    });



    this.childs = []
    // this.model.material = this.boatToonMaterial
    const textures = []
    this.model.traverse((child) => {

      if (child instanceof THREE.Mesh) {
        this.childs.push(child)
        textures.push(child.material.map)
        child.material = material
        console.log(child.name)


      }
    })

    this.model.castShadow = true




    // boatFlag.scale(1, 0.1, 1)
    gsap.set(this.boatFlag1.scale, { x: 1, y: 1, z: 1 })
    gsap.set(this.boatFlag3.scale, { x: 1, y: 1, z: 1 })
    // boatPlane.visible = false
    this.model.scale.set(0.2, 0.2, 0.2)
    // this.model.position.set(0, 6, 0) // check in ThrdPeson cam
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
        container: this.ThirdPersonCamera.container,
      }
    )
    this.island = new Islands(
      {
        boat: this.model,
      }
    )


  }

  setParticle() {
    this.system = new System()
    this.emitter = new Emitter()


    this.particleGroup = new THREE.Group()

    this.scene.add(this.particleGroup)

    this.particleGroup.position.set(0, 2, -3.5)
    this.particleGroup.scale.set(0.1, 0.1, 0.1)
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
        gsap.to(this.boatFlag1.scale, { x: 1, y: 0.5, z: 1, duration: 1, easing: "easeOut" })
        gsap.to(this.boatFlag3.scale, { x: 1, y: 0.5, z: 1, duration: 1, easing: "easeOut" })
        // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
        this.hyperlapsPlane.visible = false

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
      this.ThirdPersonCamera.speed = 0.04
      // gsap.to(this.particleGroup.scale, { x: 0, y: 0, z: 0, duration: 3, ease: "easeOut" })
      gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })
      gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 0, duration: 1, easing: "easeOut" })

      // console.log('boost ended');
      this.hyperlapsPlane.visible = false
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
        gsap.to(this.boatFlag1.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
        gsap.to(this.boatFlag3.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "easeOut" })
        // gsap.to(this.particleGroup.scale, { x: 2, y: 3.5, z: 8, duration: 3, ease: "easeOut" })
        this.hyperlapsPlane.visible = true
      }

      // console.log("shift pressed");

    } else {
      this.ThirdPersonCamera.speed = 0.04
      this.fillBoost()
    }
  }


  update() {

    this.boatControls()
    const elapsedTime = this.time.elapsed * 0.0008
    const delta = this.clock.getDelta()
    if (this.model) {
      this.ThirdPersonCamera.update(this.time.delta)
      this.Shark.update(this.time.delta)
      this.island.update(this.time.delta)
      this.model.position.y = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.04;
      // this.model.rotation.z = Math.sin(this.model.userData.initFloating + elapsedTime) * 0.01;
      // this.axesHelper.position.copy(this.model.position)
      // Boat.modelBody.position.copy(this.model.position)
      // Boat.modelBody.quaternion.copy(this.model.quaternion)
    }
    this.hyperlapsMaterial.uniforms.uTime.value = elapsedTime
    this.system.update(delta)
  }
}

