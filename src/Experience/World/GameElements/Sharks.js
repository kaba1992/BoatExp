import Experience from "../../Experience";
import * as THREE from "three";
import { MeshBasicMaterial, Vector3, Quaternion, Matrix4, AnimationMixer } from "three";
import { log } from "three-nebula";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';

export default class Sharks {
    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.sharkModel;
        this.boat = params.boat;
        this.aggroAudio = new Audio('/Audios/Sharks/AggroSound.mp3');
        this.Sharks = [];
        this.setShark();
        this.time = new YUKA.Time();
        this.speed = 2;
    }

    setShark() {
        this.sharkMaterial = new MeshBasicMaterial({ color: 0x0ffff00 });

        for (let i = 0; i < 20; i++) {
            let clonedShark = SkeletonUtils.clone(this.resource.scene);
            clonedShark.material = this.sharkMaterial;
            clonedShark.mixer = new AnimationMixer(clonedShark);
            clonedShark.action = clonedShark.mixer.clipAction(this.resource.animations[0]);
            clonedShark.action.setLoop(THREE.LoopRepeat, Infinity);
            clonedShark.action.play();
            let distance = 20 + Math.random() * 80; // génère une distance entre 50 et 200
            let angle = Math.random() * 2 * Math.PI; // génère un angle entre 0 et 2π
            // Convertit la distance et l'angle en coordonnées x et z
            let x = Math.cos(angle) * distance;
            let z = Math.sin(angle) * distance;
            clonedShark.position.set(x, 0, z);
            clonedShark.scale.set(1.5, 1.5, 1.5);
            clonedShark.randomDirection = new Vector3(Math.random() * 10 - 1, 0, Math.random() * 10 - 1).normalize();
            clonedShark.notChasing = true;
            clonedShark.aggoSoundPlayed = false;

            this.Sharks.push(clonedShark);
            this.scene.add(clonedShark);

            setInterval(() => {
                clonedShark.randomDirection = new Vector3(Math.random() * 10 - 1, 0, Math.random() * 10 - 1).normalize();
            }, 5000);
        }
    }

    checkDistance(shark) {
        
        let distance = this.boat.position.distanceTo(shark.position);
        if (distance < 1) {
            console.log("GameOver");
           
            
            return;
        }
        if (distance <= 15 ) {
            shark.notChasing = false;
            if(!shark.aggoSoundPlayed){
                // this.aggroAudio.play();
                shark.aggoSoundPlayed = true;
            }
           
        } else if (distance > 30) {
            shark.notChasing = true;
            shark.aggoSoundPlayed = false;
        }
    }

    update(deltaTime) {
        const yukaDeltaTime = this.time.update().getDelta();

        this.Sharks.forEach(shark => {
            let sharkDirection = shark.notChasing ? shark.randomDirection : this.boat.position.clone().sub(shark.position).normalize();

            const shift = new Vector3();
            shift.copy(sharkDirection).multiplyScalar(this.speed * deltaTime * 0.003);

            const targetDirection = shark.position.clone().add(sharkDirection);
            const targetQuaternion = new Quaternion().setFromRotationMatrix(
                new Matrix4().lookAt(targetDirection, shark.position, shark.up)
            );

            shark.position.add(shift);
            shark.quaternion.slerp(targetQuaternion, deltaTime * 0.001);

            if (shark.mixer) {
                shark.mixer.update(yukaDeltaTime);
            }

            if (shark && this.boat) {
                this.checkDistance(shark);
            }

            if(shark.aggro){
                this.aggroAudio.play();
              
            }
        });
    }
}