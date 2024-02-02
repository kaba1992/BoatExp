import Experience from "../../Experience";
import * as THREE from "three";
import { MeshBasicMaterial, Vector3, Quaternion, Matrix4, AnimationMixer,MeshStandardMaterial } from "three";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';


export default class Sharks {
    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.sharkModel;
        this.camera = this.experience.camera.instance;
        this.uiManager = this.experience.uiManager;
        this.boat = params.boat;
        this.aggroAudio = new Audio('/Audios/Sharks/AggroSound.mp3');
        this.uiManager.hide('.pursuer-info');
        this.aggroAudio.volume = 0.5;
        this.Sharks = [];
        this.pursuerNumber = 0;
        this.speed = 1.3;
        this.setShark();
        this.canUpdate = params.canUpdate;
        this.time = this.experience.time;
        this.getListener(params);
    }

    getListener(params) {
        window.addEventListener('revealEnd', () => {
            this.uiManager.show('.pursuer-info', false, 'flex');
        });

        window.addEventListener('reset', () => {
            this.reset(params);
        });

    }

   async setShark() {
        this.sharkMaterial = new MeshStandardMaterial({ color: new THREE.Color(0x000000) });
        const sharkPlaneGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        const exclamationMarkMap = this.resources.items.exclamationMark;
        exclamationMarkMap.wrapS = THREE.RepeatWrapping;
        exclamationMarkMap.wrapT = THREE.RepeatWrapping;
        exclamationMarkMap.flipY = false;
        exclamationMarkMap.repeat.set(1, 1);
        exclamationMarkMap.minFilter = THREE.LinearFilter;
        exclamationMarkMap.magFilter = THREE.LinearFilter;
        //mipmaping

        const sharkPlaneMaterial = new THREE.MeshBasicMaterial({
            // color: 0x0ffff00,
            side: THREE.DoubleSide,
            map: exclamationMarkMap,
            transparent: true,
            // alphaTest: 1,
            flipY: false,
        });
        let sharkCreationPromises = [];

        for (let i = 0; i < 40; i++) {
            let promise = new Promise((resolve, reject) => {
                let clonedShark = SkeletonUtils.clone(this.resource.scene);
               
                clonedShark.traverse((child) => {
                   if(child.isMesh){
              
                    if (child.name === "PlaneShark") {
                     
                        child.layers.set(1);
                        child.material = sharkPlaneMaterial;
                        child.position.y = 1.5;
                        // child.lookAt(this.camera.position);
                        clonedShark.plane = child;
                       
                        child.visible = false;
    
                    }
                   }
                });
                clonedShark.material = this.sharkMaterial;
              
                clonedShark.mixer = new AnimationMixer(clonedShark);
                clonedShark.clips = this.resource.animations;
                clonedShark.clip = THREE.AnimationClip.findByName(clonedShark.clips, "Action");
                clonedShark.action = clonedShark.mixer.clipAction(clonedShark.clip);    
                clonedShark.action.setLoop(THREE.LoopRepeat, Infinity);
                clonedShark.action.play();
                let distance = 20 + Math.random() * 200; // génère une distance entre 50 et 200
                let angle = Math.random() * 2 * Math.PI; // génère un angle entre 0 et 2π
                // Convertit la distance et l'angle en coordonnées x et z
                let x = Math.cos(angle) * distance;
                let z = Math.sin(angle) * distance;
                clonedShark.position.set(x, 0, z);
                clonedShark.scale.multiplyScalar(1.4);
                let randomAngle = Math.random() * 2 * Math.PI;
                clonedShark.randomDirection = new Vector3(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
                clonedShark.notChasing = true;
                clonedShark.aggoSoundPlayed = false;
                clonedShark.speed = 1.3;
    
                this.Sharks.push(clonedShark);
                this.scene.add(clonedShark);
                // clonedShark.add(clonedShark.plane);
                // get random Delay between 5000 and 10000
                const randomDelay = Math.random() * (10000 - 5000) + 5000;
    
    
    
                setInterval(() => {
                    let randomAngle = Math.random() * 2 * Math.PI;
                    clonedShark.randomDirection = new Vector3(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
                }, randomDelay);
                resolve(clonedShark);
            });
            sharkCreationPromises.push(promise);
           
        }
        await Promise.all(sharkCreationPromises);
        console.log("all sharks loaded");
    }

    async checkDistance(shark) {
        const gameOverEvent = new Event('gameOver');

        let distance = this.boat.position.distanceTo(shark.position);
        if (distance <= 4) {


            window.dispatchEvent(gameOverEvent);


            return;
        }
        if (distance <= 15) {
            shark.notChasing = false;
            if (!shark.aggoSoundPlayed) {
                this.aggroAudio.play();
                this.pursuerNumber++;
                this.uiManager.fadeIn('.pursuer-info', 0.5);
                shark.plane.visible = true;
                shark.aggoSoundPlayed = true;
                shark.speed = 1.5;
                await new Promise(r => setTimeout(r, 2000));
                shark.plane.visible = false;
            }

        } else if (distance > 8) {
            shark.notChasing = true;
            if (shark.aggoSoundPlayed) {
                this.pursuerNumber--;
                shark.speed = 1.3;
                if (this.pursuerNumber <= 0) {
                    this.uiManager.fadeOut('.pursuer-info', 0.5);
                }
            }
            shark.aggoSoundPlayed = false;
        }
    }

    update(deltaTime) {

        const pursuerNumber = document.querySelector('.pursuer-number');
        pursuerNumber.innerHTML = `X ${this.pursuerNumber}`;
        this.Sharks.forEach(shark => {
            let sharkDirection = shark.notChasing ? shark.randomDirection : this.boat.position.clone().sub(shark.position).normalize();

            const shift = new Vector3();
            shift.copy(sharkDirection).multiplyScalar(shark.speed * deltaTime * 0.003);

            const targetDirection = shark.position.clone().add(sharkDirection);
            const targetQuaternion = new Quaternion().setFromRotationMatrix(
                new Matrix4().lookAt(targetDirection, shark.position, shark.up)
            );

            shark.position.add(shift);
            shark.quaternion.slerp(targetQuaternion, deltaTime * 0.002);

            if (shark.mixer) {
                shark.mixer.update(this.time.delta * 0.003);
            }

            if (shark && this.boat) {
                this.checkDistance(shark);
            }

            if (shark.aggro) {
                this.aggroAudio.play();

            }
        });
    }

    reset(params) {
       
        this.aggroAudio.volume = 0.5;
       
        this.pursuerNumber = 0;
        this.canUpdate = params.canUpdate;
        // reset sharks
        this.Sharks.forEach(shark => {
            shark.plane.visible = false;
            shark.notChasing = true;
            shark.aggoSoundPlayed = false;
            let distance = 20 + Math.random() * 200; // génère une distance entre 50 et 200
            let angle = Math.random() * 2 * Math.PI; // génère un angle entre 0 et 2π
            // Convertit la distance et l'angle en coordonnées x et z
            let x = Math.cos(angle) * distance;
            let z = Math.sin(angle) * distance;
            shark.position.set(x, 0, z);
            shark.speed = 1.3;
            
            let randomAngle = Math.random() * 2 * Math.PI;
            shark.randomDirection = new Vector3(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
     
        });
    }
}