import * as CANNON from 'cannon-es'
import Experience from '../Experience';

export default class InitCannon {

    constructor() {
        this.experience = new Experience();
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0) 
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.defaultMaterial = new CANNON.Material("default")
        this.groundMaterial = new CANNON.Material("groundMaterial")
        this.slippery_ground = new CANNON.Material("slipperyMaterial")
        this.defaultContactMaterial = new CANNON.ContactMaterial(this.groundMaterial, this.slippery_ground, {
          friction: 0.0005, // Friction with the ground
          restitution: 0.3, // Restitution (bounciness)
        })
        this.world.defaultContactMaterial = this.defaultContactMaterial
        this.time =  this.experience.time;
  
    }




    update() {
        const deltaTime = this.time.deltaTime;
        this.world.fixedStep()
        
    }
}