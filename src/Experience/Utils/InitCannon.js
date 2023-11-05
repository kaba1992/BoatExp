import * as CANNON from 'cannon-es'
import Experience from '../Experience';

export default class InitCannon {

    constructor() {
        this.experience = new Experience();
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.time =  this.experience.time;
    }




    update() {
        const deltaTime = this.time.deltaTime;
        this.world.fixedStep()
        
    }
}