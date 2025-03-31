
//"Volcano Island Lowpoly" (https://skfb.ly/6YEtt) by Animateria is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

import Experience from "../../Experience"
import * as THREE from "three"


export default class Island {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.renderTexture = this.experience.renderer.renderTexture
        // this.time = this.experience.time
        this.resource = this.resources.items.miniIslandModel
        this.emptysResource = this.resources.items.emptysModel
        this.bigIslandResource = this.resources.items.volcanoModel
        this.boat = params.boat
        this.group = new THREE.Group()
        this.miniIslands = []
        this.miniIslandEmpty = []
        this.bigIslands = []
        this.setMiniIslands()
        this.scene.add(this.group)
        this.miniIslands.forEach(miniIsland => {

        })
    }


    async setMiniIslands() {
        const textureLoader = new THREE.TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/bakedNew.jpg')
        miniIslandTexture.colorSpace = THREE.SRGBColorSpace
        miniIslandTexture.flipY = false
        const miniIslandMaterial = new THREE.MeshBasicMaterial({ map: miniIslandTexture })

        this.miniIsland = this.resource.scene
        this.bigIsland = this.bigIslandResource.scene.children[0]
     

        this.emptysParent = this.emptysResource.scene

        this.emptysParent.traverse((child) => {

            this.miniIslandEmpty.push(child)

        });


        const instanceCount = 13;
        const miniIslandMesh = this.miniIsland.children.find(child => child.isMesh);
        const bigIslandMesh = this.bigIsland.children.find(child => child.isMesh);
        let minScale = 3;

        let promises = []
        for (let i = 0; i < this.miniIslandEmpty.length; i++) {
            // create 25 island with 1 miniIslandMesh
            // set the miniIsland position to the miniIslandEmpty position
            let miniIslandPromise = new Promise((resolve, reject) => {
                if (this.miniIslandEmpty[i].name.startsWith('Island')) {

                    const miniIsland = new THREE.Mesh(miniIslandMesh.geometry, miniIslandMaterial);
                    miniIsland.geometry.computeBoundingBox();
                    this.miniIslands.push(miniIsland)
                    miniIsland.position.copy(this.miniIslandEmpty[i].position)
                    // get rando float between 1 and 3
                    const scale = Math.random() * (6 - minScale) + minScale;

                    let y = scale < 1.5 ? 0.8 : 1.3;
                    miniIsland.scale.multiplyScalar(scale)
                    miniIsland.position.y = y

                    this.group.add(miniIsland)
                    resolve(miniIsland)
                }
            })
            promises.push(miniIslandPromise)

            let bigIslandPromise = new Promise((resolve, reject) => {
                if (this.miniIslandEmpty[i].name.startsWith('BigIsland')) {
                    const bigIsland = this.bigIsland.clone()
                  
                  
                  
                     const bigIslandMesh = bigIsland.children[5]
               
                    bigIsland.scale.multiplyScalar(0.2)
                    bigIsland.position.copy(this.miniIslandEmpty[i].position)
                    bigIsland.position.y = -2.4
                    bigIslandMesh.geometry.computeBoundingBox();
                    this.miniIslands.push(bigIslandMesh)

                    this.group.add(bigIsland)

                    resolve(bigIsland)
                }
            })
            promises.push(bigIslandPromise)
        }
        await Promise.all(promises)
     

    }

    detectCollision(boat, islands) {
        boat.userData.currentPosition = boat.position.clone();
        for (let i = 0; i < islands.length; i++) {

            if (boat != islands[i]) {

                let firstObject = boat;

                let secondObject = islands[i];

                let firstBB = new THREE.Box3()
                let secondBB = new THREE.Box3()
         
                firstBB.copy(firstObject.children[4].geometry.boundingBox).applyMatrix4(firstObject.matrixWorld);
       
                secondBB.copy(secondObject.geometry.boundingBox).applyMatrix4(secondObject.matrixWorld);

                let collision = firstBB.intersectsBox(secondBB);

                if (collision) {

                   // Calcul de la direction de la poussée pour repousser le bateau hors de l'île
                   let direction = new THREE.Vector3().subVectors(boat.position, islands[i].position).normalize();
                
                   direction.y = 0;
                   
                   boat.position.add(direction.multiplyScalar(0.05)); 

                   boat.position.y = boat.userData.currentPosition.y; 

                }

            }

        }
    }


    update(deltaTime) {
    
        this.detectCollision(this.boat, this.miniIslands)
    }
}
