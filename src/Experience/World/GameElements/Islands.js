
//"Volcano Island Lowpoly" (https://skfb.ly/6YEtt) by Animateria is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

import Experience from "../../Experience"
import * as THREE from "three"
import { gsap } from "gsap";
import { Sine } from "gsap/all";
import { log } from "three-nebula";
import * as CANNON from 'cannon-es'
import CannonDebugger from "cannon-es-debugger";
import { threeToCannon, ShapeType } from 'three-to-cannon';

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
        this.CannonDebugger = new CannonDebugger(this.scene, this.experience.physic.world)
        this.scene.add(this.group)
        this.miniIslands.forEach(miniIsland => {
            miniIsland.position.copy(miniIsland.body.position)
            miniIsland.quaternion.copy(miniIsland.body.quaternion)


        })


    }


    setMiniIslands() {
        const textureLoader = new THREE.TextureLoader()
        const miniIslandTexture = textureLoader.load('textures/Islands/bakedNew.jpg')
        miniIslandTexture.colorSpace = THREE.SRGBColorSpace
        miniIslandTexture.flipY = false
        const miniIslandMaterial = new THREE.MeshBasicMaterial({ map: miniIslandTexture })
        this.miniIsland = this.resource.scene
        this.bigIsland = this.bigIslandResource.scene
    
        this.emptysParent = this.emptysResource.scene

        this.emptysParent.traverse((child) => {

            this.miniIslandEmpty.push(child)

        });


        const instanceCount = 13;
        const miniIslandMesh = this.miniIsland.children.find(child => child.isMesh);
        const bigIslandMesh = this.bigIsland.children.find(child => child.isMesh);
        let minScale = 3;

        for (let i = 0; i < this.miniIslandEmpty.length; i++) {
            // create 25 island with 1 miniIslandMesh


            // set the miniIsland position to the miniIslandEmpty position
            if (this.miniIslandEmpty[i].name.startsWith('Island')) {
                const miniIsland = new THREE.Mesh(miniIslandMesh.geometry, miniIslandMaterial);
                this.miniIslands.push(miniIsland)

                // get rando float between 1 and 3
                const scale = Math.random() * (6 - minScale) + minScale;
                
                let y = scale < 1.5 ? 0.8 : 1.3;
                miniIsland.scale.multiplyScalar(scale)
                // get miniIsland radius depending on boundingSphere radius
                const radius = miniIslandMesh.geometry.boundingSphere.radius * scale
                
                const result = threeToCannon(miniIsland, { type: ShapeType.BOX });
                
                const { shape, offset, quaternion } = result;
                
                miniIsland.body = new CANNON.Body({
                    // sphereShape
                    mass: 0,
                    
                    type: CANNON.Body.STATIC,
                    // position: new CANNON.Vec3(miniIsland.position.x, miniIsland.position.y, miniIsland.position.z)
                    
                });
                miniIsland.body.addShape(shape, offset, quaternion);
                miniIsland.body.position.copy(this.miniIslandEmpty[i].position)
                miniIsland.body.position.y = y
                this.experience.physic.world.addBody(miniIsland.body)
                this.group.add(miniIsland)

            }
            if (this.miniIslandEmpty[i].name.startsWith('BigIsland')) {
                const bigIsland = this.bigIsland.clone()
            
                bigIsland.scale.multiplyScalar(0.2)

                this.miniIslands.push(bigIsland)
                const radius = bigIslandMesh.geometry.boundingSphere.radius * 0.2
                const result = threeToCannon(bigIsland, { type: ShapeType.BOX });
                
                const { shape, offset, quaternion } = result;
                
                bigIsland.body = new CANNON.Body({
                    // sphereShape
                    mass: 0,
                    
                    type: CANNON.Body.STATIC,
                    // position: new CANNON.Vec3(bigIsland.position.x, bigIsland.position.y, bigIsland.position.z)
                    
                });
                bigIsland.body.addShape(shape, offset, quaternion);
                bigIsland.body.position.copy(this.miniIslandEmpty[i].position)
                bigIsland.body.position.y = -2.4
                bigIsland.body.wakeUp()
                this.experience.physic.world.addBody(bigIsland.body)
                this.group.add(bigIsland)

            }
        }


    }

    setCollider() {
        this.staticGenerator = new StaticGeometryGenerator(this.group);
        this.staticGenerator.attributes = ['position'];
        const mergedGeometry = this.staticGenerator.generate();
        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

        this.collider = new THREE.Mesh(mergedGeometry);
        this.collider.material.wireframe = true;
        this.collider.material.opacity = 0.5;
        this.collider.material.transparent = true;

        this.visualizer = new MeshBVHVisualizer(this.collider, 1);

        this.scene.add(this.visualizer)
        this.scene.add(this.collider);
        this.scene.add(this.group)


    }

    update(deltaTime) {
        this.CannonDebugger.update()
        this.miniIslands.forEach(miniIsland => {
            miniIsland.position.copy(miniIsland.body.position)
            miniIsland.quaternion.copy(miniIsland.body.quaternion)


        })
    }
}
