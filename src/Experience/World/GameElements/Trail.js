import Experience from "../../Experience"
import * as THREE from "three"
import System, { Body, Emitter, Life, Vector3D, Mass, RadialVelocity, Radius, Rate, Span, SpriteRenderer, Scale, RandomDrift, Alpha, Color, Force, log } from "three-nebula"


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
                transparent: true,
                depthWrite: false,
                depthTest: true,
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

  
    update(delta) {
        const deltaTime = this.clock.getDelta()
        this.system.update(deltaTime)
  
    }

}