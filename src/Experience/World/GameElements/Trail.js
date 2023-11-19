import Experience from "../../Experience"
import * as THREE from "three"
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color, Force } from "three-nebula"


export default class Trail {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.model = params.boat
        this.clock = new THREE.Clock()
        this.particleGroup = new THREE.Group()
        
        this.setParticle()

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
                new Radius(2,2),
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
        // this.scene.add(this.particleGroup)
        console.log(this.model);
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

    update(delta) {
        const deltaTime = this.clock.getDelta()
        this.system.update(deltaTime)
       
    }

}