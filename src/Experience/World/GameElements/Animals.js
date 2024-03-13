//"Clown fish" (https://skfb.ly/PXsC) by rubykamen is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
//"Blue Whale - Textured" (https://skfb.ly/67RFV) by Bohdan Lvov is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import Experience from "../../Experience";
import { gsap } from "gsap";



export default class Animals {
    constructor(params) {

        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.fishModel;
        this.whaleResource = this.resources.items.whaleModel;
        this.krakenResource = this.resources.items.krakenModel;
        this.birdsResource = this.resources.items.birdsModel;
        this.birdsParent = null;
        this.boat = params.boat;
        this.time = this.experience.time;
        this.camera = this.experience.camera.instance;
        this.boaPosition = new THREE.Vector3()
        this.birdsArray = [];
        this.fishs = [];
        this.isKrakenPop = false;
        this.canRemoveBody = false;
        this.isGameOver = false;
        this.krakenInterval = null;
        this.setWhales();
        this.setFishs();
        this.isPlayerInRadar = false;
        this.setKraken();
        this.setBirds();
        window.addEventListener('reset', () => {
            this.reset()
        })
        window.addEventListener('gameOver', () => {
            this.isGameOver = true;
            clearInterval(this.krakenInterval);

        });


    }

    setFishs() {
        this.fish = this.resource.scene.children[0];

        this.scene.add(this.fish);
        this.fish.position.set(0, -2.6, 0);
        this.fish.scale.set(2, 2, 2);

        console.log(this.fish);

        const clips = this.resource.animations;

        const fishes = new THREE.AnimationObjectGroup();
        this.fishMixer = new THREE.AnimationMixer(fishes);
        const clip = THREE.AnimationClip.findByName(clips, "Take 01");
        const action = this.fishMixer.clipAction(clip);
        fishes.add(this.fish);
        action.play();
        for (let i = 0; i < 10; i++) {
            const fishClone = SkeletonUtils.clone(this.fish);
            fishes.add(fishClone);
            this.scene.add(fishClone);
            let distance = 5 + Math.random() * 100; // génère une distance entre 50 et 200
            let angle = Math.random() * 2 * Math.PI; // génère un angle entre 0 et 2π
            // Convertit la distance et l'angle en coordonnées x et z
            let x = Math.cos(angle) * distance;
            let z = Math.sin(angle) * distance;
            fishClone.position.set(x, -2.3, z);
        }

    }
    setWhales() {
        this.whale = this.whaleResource.scene.children[0];
        // this.scene.add(this.whale);
        this.whale.position.set(0, -0.8, 0);


        const clips = this.whaleResource.animations;

        const whales = new THREE.AnimationObjectGroup();
        this.whaleMixer = new THREE.AnimationMixer(this.whale);
        const clip = THREE.AnimationClip.findByName(clips, "SWIM-delphinidae");
        const action = this.whaleMixer.clipAction(clip);
        action.play();

    }

    setKraken() {

        this.kraken = this.krakenResource.scene.children[0];
        const radarMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5,
        });
        this.krakenMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: new THREE.Color("grey"),

        });
        this.krakenMaterial.depthTest = false;
        this.kraken.traverse((child) => {
            if (child.isMesh) {
                child.material = this.krakenMaterial;
                child.layers.set(1);
            }
        });
        // make kraken material fade 

        this.radar = new THREE.Mesh(new THREE.CircleGeometry(20, 32), radarMaterial);
        this.radar.rotation.x = - Math.PI * 0.5
        this.radar.position.set(0, 0.001, 0);
        this.radar.layers.set(1);
        gsap.set(this.krakenMaterial, { opacity: 0 });
        gsap.set(this.radar.material, { opacity: 0 });
        gsap.set(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1 });
        this.radar.position.set(0, -50, 0);
        this.kraken.position.set(0, -50, 0);
        this.kraken.scale.multiplyScalar(10);
        this.scene.add(this.kraken);
        this.scene.add(this.radar);


        const clips = this.krakenResource.animations;
        const kraken = new THREE.AnimationObjectGroup();
        this.krakenMixer = new THREE.AnimationMixer(this.kraken);
        const clip = THREE.AnimationClip.findByName(clips, "Take 001");
        const action = this.krakenMixer.clipAction(clip);
        action.play();
    }


    attack() {
        gsap.to(this.radar.material, { opacity: 0.5, duration: 3 });
        let boatPosbeforeAttack = new THREE.Vector3(this.boat.position.x, this.radar.position.y, this.boat.position.z);


        const OnScaleComplete = () => {

            this.kraken.position.set(boatPosbeforeAttack.x, 1, boatPosbeforeAttack.z);
            gsap.to(this.krakenMaterial, { opacity: 1, duration: 1 });
            this.krakenMaterial.depthTest = true;


            setTimeout(() => {
                if (!this.isPlayerInRadar) {
                    console.log("kraken position", this.kraken.position);
                    gsap.to(this.radar.material, { opacity: 0, duration: 1 });
                    gsap.to(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 1 });
                    // reset radar body position
                    // this.radar.position.set(0, -50, 0);


                }
            }, 500);

        };
        gsap.to(this.radar.scale, { x: 1, y: 1, z: 1, duration: 4, onComplete: OnScaleComplete });
        this.radar.position.set(boatPosbeforeAttack.x, 0.001, boatPosbeforeAttack.z);

    }

    async releaseKraken() {
        this.attack();
        this.krakenInterval = setInterval(() => {
            this.attack();
        }, 10000);


    }

    setBirds() {
        this.birdsResource.scene.traverse((child) => {
            if (child.name === "birdParent") {
                this.birdsParent = child;
            }
        });
        this.birdsParent.position.set(0, 9, 0);

        this.birds = this.birdsResource.scene.children;
        let randomAngle = Math.random() * 2 * Math.PI;
        this.birdsParent.randomDirection = new THREE.Vector3(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
        console.log(this.birdsResource);
        for (let i = 0; i < this.birds.length; i++) {
            const bird = this.birds[i];
            this.scene.add(bird);

            this.birdsArray.push(bird);
            bird.clips = this.birdsResource.animations;
            bird.mixer = new THREE.AnimationMixer(bird);
            bird.clip = THREE.AnimationClip.findByName(bird.clips, "ArmatureAction.006");
            bird.lookAt(this.birdsParent.randomDirection);
            bird.action = bird.mixer.clipAction(bird.clip);
            bird.action.play();


        }
        const randomDelay = Math.random() * (15000 - 10000) + 10000;
        setInterval(() => {
            let randomAngle = Math.random() * 2 * Math.PI;
            this.birdsParent.randomDirection = new THREE.Vector3(Math.cos(randomAngle), 0, Math.sin(randomAngle)).normalize();
        }, randomDelay);
    }
    setBirdsAnim() {

        for (let i = 0; i < this.birdsArray.length; i++) {
            const bird = this.birdsArray[i];
            bird.mixer.update(this.time.delta * 0.001);

        }

        const shift = new THREE.Vector3();
        shift.copy(this.birdsParent.randomDirection).multiplyScalar(1.5 * this.time.delta * 0.003);
        const targetDirection = this.birdsParent.position.clone().add(this.birdsParent.randomDirection);
        // console.log(targetDirection);
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(targetDirection, this.birdsParent.position, this.birdsParent.up)
        );

        this.birdsParent.position.add(shift);
        this.birdsParent.quaternion.slerp(targetQuaternion, this.time.delta * 0.002);


    }

    update(delta) {
        this.setBirdsAnim();
        if (this.fishMixer && this.krakenMixer) {
            this.fishMixer.update(delta * 0.001);
            // this.whaleMixer.update(delta *0.0002);
            this.krakenMixer.update(delta * 0.001);
        }
        if (this.radar) {
            // this.radar.material.uniforms.uTime.value = delta;
        }
        if (window.score >= 2 && !this.isKrakenPop) {
            this.releaseKraken();
            console.log("pop kraken");
            this.isKrakenPop = true;
        }

        if (this.isGameOver) {

            setTimeout(() => {
                clearInterval(this.krakenInterval);
                this.isGameOver = false;

            }, 1000);
        }
        this.boaPosition = this.boat.position;

        if (this.kraken.position.distanceTo(this.boaPosition) <= 22) {
            this.isPlayerInRadar = true;

        }

        if (this.isPlayerInRadar) {
            this.isPlayerInRadar = false;
            this.kraken.position.set(this.boaPosition.x - 4, 1, this.boaPosition.z - 2);
            this.krakenMaterial.depthTest = true;
            gsap.to(this.krakenMaterial, { opacity: 1, duration: 1 });
            this.isGameOver = true;
            const event = new Event('gameOver');
            window.dispatchEvent(event);
        }


    }

    reset() {
        this.isKrakenPop = false;
        this.canRemoveBody = false;
        this.isGameOver = false;
        this.krakenInterval = null;
        gsap.set(this.krakenMaterial, { opacity: 0 });
        gsap.set(this.radar.material, { opacity: 0 });
        gsap.set(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1 });
        this.kraken.position.set(0, -50, 0);
        this.isPlayerInRadar = false;
        clearInterval(this.krakenInterval);

        // this.krakenMaterial.depthTest = false;

    }

}