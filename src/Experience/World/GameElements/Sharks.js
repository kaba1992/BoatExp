
import Experience from "../../Experience"
import { MeshBasicMaterial, Vector3 } from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export default class Sharks {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // this.time = this.experience.time
        this.resource = this.resources.items.sharkModel
        this.boat = params.boat
        this.setShark()
        this.speed = 0.5
        this.shift = new Vector3()
        this.randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
        

    }



    setShark() {
        setInterval(() => {
            this.randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();

        }, 5000)
        this.shark = this.resource.scene
        this.sharMaterial = new MeshBasicMaterial({ color: 0x0ffff00 })
        this.shark.material = this.sharMaterial
        this.shark.position.set(0, -0.4, 0)
        this.sharkGeometry = this.shark.children[0].geometry

       
       
        this.scene.add(this.shark)
        // give random movement to the shark

    }

    update(deltaTime) {

        this.shift.copy(this.randomDirection).multiplyScalar(this.speed * deltaTime * 0.005)
        this.shark.position.add(this.shift)
        // console.log(this.shark.position);
    }
}