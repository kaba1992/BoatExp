import Experience from "../../Experience"
import * as THREE from "three"
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color, Force, log } from "three-nebula"
import rippleVertex from './../../../../static/shaders//Boat/rippleVertex.glsl'
import rippleFragment from './../../../../static/shaders//Boat/rippleFragment.glsl'

export default class Trail {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.model = params.boat
        this.clock = new THREE.Clock()
        this.particleGroup = new THREE.Group()

        this.setParticle()
        this.disk = this.model.getObjectByName("Circle")
        this.disk.visible = false
        // this.setRipples()

    }


    setParticle() {
        this.system = new System()
        this.emitter = new Emitter()




        this.particleGroup.position.set(0, -0.5, -3.5)
        // this.particleGroup.scale.set(0.2, 0.2, 0.2)
        this.scene.add(this.particleGroup)
        // this.particleGroup.rotateY(-Math.PI / 2)

        this.particleRenderer = new SpriteRenderer(this.particleGroup, THREE);
        const texture = new THREE.TextureLoader().load("../textures/bubleParticle.png")

        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                // color: 0x0000ff,
                transparent: true,
                depthWrite: false,
                depthTest: true,
                // blending: THREE.AdditiveBlending,
                fog: true,
            })
        )

        const color = new THREE.Color("#00A9FF");
        const coneAngle = 45; // Angle du cône en degrés
        const speed = 10; // Vitesse des particules

        this.emitter
            .setRate(new Rate(new Span(2, 2), 0.001))
            .setInitializers([
                new Mass(1),
                new Radius(2, 2),
                new Life(2.5),
                new Body(sprite),
                new RadialVelocity(speed, new Vector3D(0, 0, 1), coneAngle),
            ])
            .setBehaviours([
                new Alpha(1, 0.5),
                new Scale(0.5, 2),
                new Color(color),
                new Force(0, 0, -1),

            ])
            .emit();

        this.system.addEmitter(this.emitter).addRenderer(this.particleRenderer)


        this.model.add(this.particleGroup)


    }

    setRipples() {

        
        this.disk = this.model.getObjectByName("Circle")
        // this.disk.position.set(0, 1.75,0)
        // // this.disk.rotation.set(-Math.PI / 2, 0, 0)
        // this.disk.scale.x = 2
        // this.model.add(this.disk)
        this.disk.layers.set(1)
        const rippleText = this.resources.items.rippleTexture
        // rippleText.wrapS = rippleText.wrapT = THREE.RepeatWrapping;
        // rippleText.repeat.set(1, 1);
        

        // console.log(this.disk);
        this.rippleMaterial = new THREE.ShaderMaterial({
            vertexShader: rippleVertex,
            fragmentShader: rippleFragment,
            // transparent: true,
            // depthWrite: false,
            // depthTest: true,
            uniforms: {
                time: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uNoiseTexture: { value: rippleText},

            }
        })
        this.disk.material = this.rippleMaterial
        console.log(this.disk);
    }

    update(delta) {
        const deltaTime = this.clock.getDelta()
        this.system.update(deltaTime)
        // this.rippleMaterial.uniforms.time.value += deltaTime
       
       

    }

}