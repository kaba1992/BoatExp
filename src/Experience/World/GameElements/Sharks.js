
import Experience from "../../Experience"
import * as THREE from "three"
import { MeshBasicMaterial, Vector3, Quaternion, Matrix4, AnimationMixer } from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';
import Islands from "./Islands";
// import ThirdPersonCamera from "../ThirdPersonCamera";

export default class Sharks {
    constructor(params) {
        this.experience = new Experience()
        this.islands = new Islands(params)
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.sharkModel
        this.boat = params.boat
        this.container = params.container
        this.speed = 0.05
        this.shift = new Vector3()
        this.randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
        this.mixer = null
        this.entityManager = new YUKA.EntityManager()
        this.sharks = []
        this.time = new YUKA.Time();
        this.target = new YUKA.Vector3();
        this.obstacles = []
        this.setShark()
        this.setPoursuite()
        this.setFollowPath()
        this.notChasing = true
        // this.boat.matrixAutoUpdate = false


    }

    setPoursuite() {

        const evader = new YUKA.Vehicle();
        this.chaser = new YUKA.Vehicle();

        // evader.position.set(10, 0, -6);
        evader.maxSpeed = 1;
        evader.setRenderComponent(this.container, sync);

        this.chaser.setRenderComponent(this.shark.children[0].children[0], sync);

        // this.shark.updateMatrix()
        // console.log(path.current());
        // this.chaser.position.set(2, 0, -3);
        this.chaser.maxSpeed = 3;
        // this.chaser.scale.set(0.5, 0.5, 0.5)
        // this.chaser.position.set(-2, 0, 10);

        const poursuitBehavior = new YUKA.PursuitBehavior(evader, 2);
        this.chaser.steering.add(poursuitBehavior);

        const seekBehavior = new YUKA.SeekBehavior(this.container.position);
        evader.steering.add(seekBehavior);
        this.entityManager.add(evader);
        this.entityManager.add(this.chaser);
        this.setUpObstacles()


        this.chaser.active = false

        function sync(entity, renderComponent) {
            renderComponent.matrix.copy(entity.worldMatrix);
        }
    }

    setFollowPath() {
        const path = new YUKA.Path();
        // random path 
        for (let i = 0; i < 10; i++) {
            path.add(new YUKA.Vector3(Math.random() * 100 - 1, 0, Math.random() * 100 - 1));  

        }
       
        path.loop = true;

        const vehicle = new YUKA.Vehicle();
        vehicle.position.copy(path.current());
        vehicle.maxSpeed = 1.5;
        vehicle.setRenderComponent(this.shark, sync);

        const followPathBehavior = new YUKA.FollowPathBehavior(path);
        vehicle.steering.add(followPathBehavior);

        const onPathBehavior = new YUKA.OnPathBehavior(path);
        vehicle.steering.add(onPathBehavior);
        // set up obstacles
        this.setUpObstacles()

    // add obstacles behavior
    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(this.obstacles);
    vehicle.steering.add(obstacleAvoidanceBehavior);

    

        this.entityManager.add(vehicle);

        function sync(entity, renderComponent) {
            renderComponent.matrix.copy(entity.worldMatrix);
        }
    }

    setUpObstacles() {
        for (let i = 0; i < this.islands.miniIslands.length; i++) {
            const obstacle = new YUKA.GameEntity();
            obstacle.position.copy(this.islands.miniIslands[i].position);
            obstacle.boundingRadius = this.islands.miniIslands[i].geometry.boundingSphere.radius
            this.islands.miniIslands[i].geometry.computeBoundingSphere()
            this.entityManager.add(obstacle);
            this.obstacles.push(obstacle);
        }
    }

    checkDistance() {
        let distance = this.container.position.distanceTo(this.chaser.position);
        // console.log(distance);

        if (distance < 1) {
            this.chaser.active = false;
            // console.log("GameOver");
            return; // Sort de la fonction dès que cette condition est vraie
        }
        if (distance < 15) {
            this.notChasing = false;
            this.chaser.active = true;
            // console.log("chasing");
        } else if (distance > 15) {
            this.notChasing = true;
            this.chaser.active = false;
            // console.log("notChasing");
        }
    }
    setShark() {
        setInterval(() => {
            this.randomDirection = new Vector3(Math.random() * 10 - 1, 0, Math.random() * 10 - 1).normalize();

        }, 5000)
        this.shark = this.resource.scene
        this.sharMaterial = new MeshBasicMaterial({ color: 0x93a3ac })
        this.shark.material = this.sharMaterial
        this.sharkGeometry = this.shark.children[0].children[0].geometry
        this.sharkGeometry.computeBoundingSphere()
        console.log(this.shark);
        //scale sharkGeometry

        // this.sharkGeometry.matrixAutoUpdate = false;
        this.shark.name = "shark"
        this.mixer = new AnimationMixer(this.shark)
        let action = this.mixer.clipAction(this.resource.animations[0])
        action.play()
        this.shark.matrixAutoUpdate = false;
        this.scene.add(this.shark)
    }

    update(deltaTime) {
        const yukaDeltaTime = this.time.update().getDelta();
     


        this.entityManager.update(yukaDeltaTime);

        if (this.notChasing) {
            // this.shift.copy(this.randomDirection).multiplyScalar(this.speed * deltaTime * 0.03)
            // // Détermine le point vers lequel le requin devrait regarder
            // const targetDirection = this.shark.position.clone().add(this.randomDirection)
            // // Crée un quaternion qui regarde vers la direction cible
            // const targetQuaternion = new Quaternion().setFromRotationMatrix(
            //     new Matrix4().lookAt(targetDirection, this.shark.position, this.shark.up)
            // )

            // this.shark.position.add(this.shift)
            // // Slerp entre le quaternion actuel du requin et le quaternion cible
            // this.shark.quaternion.slerp(targetQuaternion, deltaTime * 0.001)
            // this.shark.updateMatrix()
        }
        this.entityManager.update(yukaDeltaTime);

        if (this.mixer) {
            this.mixer.update(yukaDeltaTime)
        }

        // this.checkDistance()
    }
}