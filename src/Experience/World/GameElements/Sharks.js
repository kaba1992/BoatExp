import Experience from "../../Experience";
import * as THREE from "three";
import { MeshBasicMaterial, Vector3, Quaternion, Matrix4, AnimationMixer } from "three";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';
import UiManager from "../../../UI/UiManager";

export default class Sharks {
    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.sharkModel;
        this.camera = this.experience.camera.instance;
        this.uiManager = new UiManager();
        this.uiManager.hide('.pursuer-info');
        this.boat = params.boat;
        this.aggroAudio = new Audio('/Audios/Sharks/AggroSound.mp3');
        this.aggroAudio.volume = 0.5;
        this.Sharks = [];
        this.setShark();
        this.pursuerNumber = 0;
        this.time = new YUKA.Time();
        this.speed = 1.2;
        this.getListener();
    }

    getListener() {
        window.addEventListener('revealEnd', () => {
            this.uiManager.show('.pursuer-info', false);
        });

    }

    setShark() {
        this.sharkMaterial = new MeshBasicMaterial({ color: 0x0ffff00 });
        const sharkPlaneGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        const exclamationMarkMap = this.resources.items.exclamationMark;
        exclamationMarkMap.wrapS = THREE.RepeatWrapping;
        exclamationMarkMap.wrapT = THREE.RepeatWrapping;
        exclamationMarkMap.repeat.set(1, 1);
        exclamationMarkMap.minFilter = THREE.LinearFilter;
        exclamationMarkMap.magFilter = THREE.LinearFilter;
        //mipmaping

        const sharkPlaneMaterial = new THREE.MeshBasicMaterial({
            // color: 0x0ffff00,
            side: THREE.DoubleSide,
            map: exclamationMarkMap,
            transparent: true,
            alphaTest: 0.5,

        });


        for (let i = 0; i < 20; i++) {
            let clonedShark = SkeletonUtils.clone(this.resource.scene);
            clonedShark.plane = new THREE.Mesh(sharkPlaneGeometry, sharkPlaneMaterial);
            // clonedShark.plane.lookAt(this.camera.position);
            clonedShark.plane.position.set(0, 1, 0);
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
            clonedShark.randomDirection = new Vector3(Math.random() * 10 - 10, 0, Math.random() * 10 - 10).normalize();
            clonedShark.notChasing = true;
            clonedShark.aggoSoundPlayed = false;

            this.Sharks.push(clonedShark);
            this.scene.add(clonedShark);
            clonedShark.add(clonedShark.plane);

            setInterval(() => {
                clonedShark.randomDirection = new Vector3(Math.random() * 10 - 10, 0, Math.random() * 10 - 10).normalize();
            }, 5000);
        }
    }

    checkDistance(shark) {

        let distance = this.boat.position.distanceTo(shark.position);
        if (distance < 1) {
            console.log("GameOver");
            shark.randomDirection = shark.position


            return;
        }
        if (distance <= 15) {
            shark.notChasing = false;
            if (!shark.aggoSoundPlayed) {
                this.aggroAudio.play();
                this.pursuerNumber++;
                this.uiManager.fadeIn('.pursuer-info', 0.5);

                shark.aggoSoundPlayed = true;
            }

        } else if (distance > 30) {
            shark.notChasing = true;
            if (shark.aggoSoundPlayed) {
                this.pursuerNumber--;
                if (this.pursuerNumber <= 0) {
                    this.uiManager.fadeOut('.pursuer-info', 0.5);
                }
            }
            shark.aggoSoundPlayed = false;
        }
    }

    update(deltaTime) {
        const yukaDeltaTime = this.time.update().getDelta();
        const pursuerNumber = document.querySelector('.pursuer-number');
        pursuerNumber.innerHTML = this.pursuerNumber;
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

            if (shark.aggro) {
                this.aggroAudio.play();

            }
        });
    }
}