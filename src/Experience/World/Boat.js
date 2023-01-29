import * as THREE from 'three'
import Experience from '../Experience.js'
import THREEx from '../Utils/Keyboard.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import { gsap } from "gsap";
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";
import * as CANNON from 'cannon-es'
import System, { Body, Emitter, Life, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color } from "three-nebula"
import MeshInitializer from '../Utils/MeshInitializer.js';
import { lerp } from "three/src/math/MathUtils"
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
        this.velocity = 300
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
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('boat')
        }

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
        const fragment = `
uniform sampler2D uTexture;
uniform float uTime;
vec3 lightColor = vec3(1.0, 1.0, 1.0);
uniform vec3 lightDirection;
uniform vec3 uColor;
varying vec2 vUv;
varying vec3 vNormal;

float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * (3.0 - 2.0 * f);

    return mix(mix(Hash(i + vec2(0., 0.)), Hash(i + vec2(1., 0.)), f.x), mix(Hash(i + vec2(0., 1.)), Hash(i + vec2(1., 1.)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.) * .5;
    v += noise(p * 2.) * .25;
    v += noise(p * 4.) * .125;
    return v;
}

void main() {
    vec3 norm = normalize(vNormal);
    vec2 uv = vUv;
    vec4 src = texture2D(uTexture, uv);

    vec4 col = src;

    float nDotL = clamp(dot(lightDirection, norm), 0.0, 1.0);
    vec3 diffuseColor = lightColor * nDotL * 6.;

    uv.x -= 1.5;

    float ctime = mod(uTime * 0.25, 2.5);
   // burn
    float d = uv.x + uv.y * .5 + .5 * fbm(uv * 15.1) + ctime * 1.3;
    if(d > .35)
        col = clamp(col - vec4((d - .35) * 10.), vec4(0.0), vec4(1.0));
    if(d > .47) {
        if(d < .5)
            col += vec4((d - .4) * 33.0 * .5 * (0.0 + noise(100. * uv + vec2(-ctime * 2., 0.))) * vec3(1.5, 0.5, 0.0), 0.0) + vec4(diffuseColor, 1.0);

    }

    gl_FragColor = col * vec4(diffuseColor, 1.0) ;
}`
        const vertex = `
uniform vec2 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying float vElevation;

void main() {
    // vec4 modelPosition =  vec4(position, 1.0);

    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
    vNormal = normal;
    vUv = uv;
    // vElevation = elevation;
}
`

        let boatMaterial;
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
                    uTime: { value: 5 },
                    uTexture: { value: textures[i] },
                    lightDirection: { value: new THREE.Vector3(3.5, 4, - 1.25).normalize() },
                    uColor: { value: childs[i].material.color }
                }
            })

            window.setTimeout(
                () => {
                    gsap.to(
                        childs[i].material.uniforms.uTime,
                        {
                            value: 0,
                            duration: 5,
                            // repeat: -1,
                            // yoyo: true,
                        }
                    )
                }, 1000
            )


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
        Boat.modelBody = AddBody.setCustomBody(
            1000, {
            type: Body.DYNAMIC,
            fixedRotation: true,
        },
            this.physic.world,
            {
                width: 45, height: 12, depth: 12
            })


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
            this.velocity = 300
            // console.log('boost ended');
        }
        else {
            this.velocity = 600
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
            this.velocity = 300
            this.fillBoost()
        }
    }


    setParticle() {
        this.system = new System()
        this.emitter = new Emitter()
        let boatTail;
        this.model.traverse(
            (child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.name === 'StylShip_Rudder_Mat_StylShip_Elements_0') {
                        boatTail = child
                    }
                }
            }
        )
        const initializer = new MeshInitializer(boatTail)
        console.log(initializer);
        this.renderer = new SpriteRenderer(this.scene, THREE);
        const life = new Life(0.5)
        const texture = new THREE.TextureLoader().load("../textures/foam.png")

        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                color: 0xff0000,
                  transparent: true,
                  depthWrite: false,
                  depthTest: true,
                blending: THREE.AdditiveBlending,
                fog: true,
            })
        )

        const color = new THREE.Color("white");
        this.emitter
            .setRate(new Rate(new Span(24, 32), new Span(0.01)))
            .setPosition(new THREE.Vector3(boatTail.position.x + 0.5, boatTail.position.y, boatTail.position.z))
            .setRotation(boatTail.rotation)
            .addInitializers([new Mass(0.5), new Radius(0.8, 1), initializer, life, new Body(sprite)])
            .addBehaviour(new Alpha(1, 0))
            .addBehaviour(new Scale(1, 2))
            .addBehaviour(new Color(color))
            .emit()

        this.system.addEmitter(this.emitter).addRenderer(this.renderer)
        this.initializer = initializer
        this.boatTail = boatTail


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
            Boat.modelBody.position.copy(this.model.position)
            Boat.modelBody.quaternion.copy(this.model.quaternion)


        }
        this.system.update(delta)
        // function easeOutCirc(x) {
        //     return Math.sqrt(1 - Math.pow(x - 1, 2))
        //   }
      
        //   const coef = easeOutCirc(Math.min(500, 500) / 500)
      
        //   this.initializer.speed = lerp(0.2, 5, coef) * -2
        // console.log(this.elapsedTime);
        this.emitter.position.copy(this.boatTail.position)
        console.log(this.boatTail.position);

    }
}