
import Experience from "../../Experience"
import * as THREE from "three"
import { MeshBasicMaterial, Vector3, Quaternion, Matrix4, AnimationMixer } from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';

export default class Sharks {
    constructor(params) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // this.time = this.experience.time
        this.resource = this.resources.items.sharkModel
        this.boat = params.boat
        this.speed = 0.5
        this.shift = new Vector3()
        this.randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
        this.mixer = null
        this.entityManager = new YUKA.EntityManager()
        this.sharks = []
        this.time = new YUKA.Time();
        this.setShark()
        this.setPoursuite()
        // this.boat.matrixAutoUpdate = false


    }

    setPoursuite() {
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.scene.add(this.cube)

        function sync(entity, renderComponent) {
            renderComponent.matrix.copy(entity.worldMatrix);

        }
        const chaser = new YUKA.Vehicle();
        chaser.setRenderComponent(this.shark, sync);

        this.entityManager.add(chaser);

        chaser.position.set(2, 0, -3);
        chaser.maxSpeed = 2;
        const evader = new YUKA.Vehicle();
        evader.setRenderComponent(this.cube, sync);
        this.entityManager.add(evader);
        evader.position.set(10, 0, -6);
        evader.maxSpeed = 2;
        const poursuitBehavior = new YUKA.PursuitBehavior(evader, 5);
        chaser.steering.add(poursuitBehavior);
        // const evadeBehavior = new YUKA.EvadeBehavior(chaser, 10, 5);
        // evader.steering.add(evadeBehavior);

        // const evaderTarget = new YUKA.Vector3();
        // const seekBehavior = new YUKA.SeekBehavior(evaderTarget);
        // evader.steering.add(seekBehavior);

    }

    setShark() {
        setInterval(() => {
            this.randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();

        }, 5000)
        this.shark = this.resource.scene
        this.sharMaterial = new MeshBasicMaterial({ color: 0x93a3ac })
        this.shark.material = this.sharMaterial
        this.sharkGeometry = this.shark.children[0].children[0].geometry
        // this.sharkGeometry.matrixAutoUpdate = false;

        this.mixer = new AnimationMixer(this.shark)
        let action = this.mixer.clipAction(this.resource.animations[0])
        action.play()
        this.shark.matrixAutoUpdate = false;
        this.scene.add(this.shark)

        this.shark.scale.set(1.5, 1.5, 1.5)
        this.shark.position.set(0, 0.55, 0)
        // give random movement to the shark

    }

    update(deltaTime) {
        const yukaDeltaTime = this.time.update().getDelta();
        // console.log(this.boat.getWorldPosition());
        this.entityManager.update(yukaDeltaTime);
        this.shift.copy(this.randomDirection).multiplyScalar(this.speed * deltaTime * 0.005)
        this.cube.position.add(this.shift)
        // Détermine le point vers lequel le requin devrait regarder
        const targetDirection = this.cube.position.clone().add(this.randomDirection)

        // Crée un quaternion qui regarde vers la direction cible
        const targetQuaternion = new Quaternion().setFromRotationMatrix(
            new Matrix4().lookAt(targetDirection, this.cube.position, this.cube.up)
        )

        // Slerp entre le quaternion actuel du requin et le quaternion cible
        this.cube.quaternion.slerp(targetQuaternion, deltaTime * 0.001)
        // console.log(this.cube.position);
        if (this.mixer) {
            this.mixer.update(yukaDeltaTime)
        }
    }
}