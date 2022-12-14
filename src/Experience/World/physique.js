import * as CANNON from 'cannon-es'
import Experience from '../Experience'
import CannonDebugger from 'cannon-es-debugger'

export default class Physique {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.world = new CANNON.World()
        this.setPhysique()
    }



    setPhysique() {
        this.world.gravity.set(0, 0, 0)
        this.world.broadphase = new CANNON.NaiveBroadphase()
        this.cannonDebugger = new CannonDebugger(this.scene, this.world, {
            // options...
        })
    }
    
    update() {
        this.world.step(1 / 60)
        this.cannonDebugger.update()
       
    }
}