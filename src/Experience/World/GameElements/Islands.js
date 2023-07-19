
import Experience from "../../Experience"
import { MeshBasicMaterial, Vector3,SRGBColorSpace,TextureLoader,Mesh, BackSide } from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';


export default class Islands {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // this.time = this.experience.time
        this.resource = this.resources.items.miniIslandModel
        this.boat = params.boat
        this.setMiniIsland()
     
        

    }



    setMiniIsland() {
        const textureLoader = new TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/baked.jpg')
        miniIslandTexture.colorSpace =SRGBColorSpace
        miniIslandTexture.flipY = false
        const miniIslandMaterial = new MeshBasicMaterial({map: miniIslandTexture   })         
        this.miniIsland = this.resource.scene
   
        this.miniIsland.traverse((child) => {
            if (child.isMesh) {
        
                child.material = miniIslandMaterial
 
          
            }
        })
        this.miniIsland.scale.set(1.5,1.5,1.5)
     
        this.miniIsland.position.set(0, -0.1, 0)
      
// clone 50 * island
        for (let i = 0; i < 20; i++) {
            const miniIslandClone = SkeletonUtils.clone(this.miniIsland)
            miniIslandClone.position.set(Math.random() * 500 - 250, -0.4, Math.random() * 500 - 250)
            this.scene.add(miniIslandClone)
        }
       
       
        // this.scene.add(this.miniIsland)
        // give random movement to the shark

    }

    update(deltaTime) {


    }
}