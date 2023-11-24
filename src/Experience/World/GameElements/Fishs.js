//"Clown fish" (https://skfb.ly/PXsC) by rubykamen is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
//"Blue Whale - Textured" (https://skfb.ly/67RFV) by Bohdan Lvov is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';
import * as THREE from 'three';
import Experience from "../../Experience";
import radarVertex from "./../../../../static/shaders/Boat/radarVertex.glsl";
import radarFragment from "./../../../../static/shaders/Boat/radarFragment.glsl";
import { gsap } from "gsap";
import * as CANNON from 'cannon-es'
import bodyTypes from '../../Utils/BodyTypes';

export default class Fishs {
    constructor(params) {

        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.physic = this.experience.physic
        this.resource = this.resources.items.fishModel;
        this.whaleResource = this.resources.items.whaleModel;
        this.krakenResource = this.resources.items.krakenModel;
        this.boat = params.boat;
        this.time = this.experience.time;
        this.camera = this.experience.camera.instance;
        this.entityManager = new YUKA.EntityManager();
        this.yukaTime = new YUKA.Time();

        this.fishs = [];
        this.isKrakenPop = false;
        this.canRemoveBody = false;
        this.isGameOver = false;
        this.krakenInterval = null;
        // this.setWhales();
        this.setFishs();
        this.setKraken();
        window.addEventListener('reset', () => {
            this.reset()
        })
  

    }

    setFishs() {
        this.fish = this.resource.scene.children[0];

        this.scene.add(this.fish);
        this.fish.position.set(0, -2.6, 0);
        this.fish.scale.set(2, 2, 2);



        const clips = this.resource.animations;

        const fishes = new THREE.AnimationObjectGroup();
        this.fishMixer = new THREE.AnimationMixer(this.fish);
        const clip = THREE.AnimationClip.findByName(clips, "Take 01");
        const action = this.fishMixer.clipAction(clip);
        fishes.add(this.fish);
        action.play();
        // for (let i = 0; i < 10; i++) {
        //     const fishClone = SkeletonUtils.clone(this.fish);
        //     fishes.add(fishClone);
        //     this.scene.add(fishClone);
        //     let distance = 5 + Math.random() * 100; // génère une distance entre 50 et 200
        //     let angle = Math.random() * 2 * Math.PI; // génère un angle entre 0 et 2π
        //     // Convertit la distance et l'angle en coordonnées x et z
        //     let x = Math.cos(angle) * distance;
        //     let z = Math.sin(angle) * distance;
        //     fishClone.position.set(x,-2.3, z);
        // }

    }
    setWhales() {
        this.whale = this.whaleResource.scene.children[0];
        this.scene.add(this.whale);
        this.whale.position.set(0, -0.8, 0);

        const clips = this.whaleResource.animations;

        const whales = new THREE.AnimationObjectGroup();
        this.whaleMixer = new THREE.AnimationMixer(this.whale);
        const clip = THREE.AnimationClip.findByName(clips, "Swimming");
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
        this.kraken.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Cylinder(20, 20, 5, 32),
            // collisionFilterGroup: bodyTypes.Kraken,
            // collisionFilterMask: bodyTypes.Boat  | bodyTypes.OBSTACLES | bodyTypes.OTHERS,
            fixedRotation: true,
            type: CANNON.Body.DYNAMIC,
            isTrigger: true,

        });
        this.physic.world.addBody(this.kraken.body);
        gsap.set(this.krakenMaterial, { opacity: 0 });
        gsap.set(this.radar.material, { opacity: 0 });
        gsap.set(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1 });
        this.kraken.body.position.set(0, 1, 0);
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
        let boatPos = new THREE.Vector3(this.boat.position.x, this.radar.position.y, this.boat.position.z);
        gsap.to(this.radar.material, { opacity: 0.5, duration: 3 });
        const OnScaleComplete = () => {
            gsap.to(this.radar.material, { opacity: 0, duration: 1 });
            gsap.to(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 1 });
            this.krakenMaterial.depthTest = true;
            gsap.to(this.krakenMaterial, { opacity: 1, duration: 1 });
            this.kraken.body.position.set(boatPos.x - 4, this.kraken.body.position.y, boatPos.z - 2);
            this.kraken.body.addEventListener("collide", (e) => {
                if (e.body === this.boat.body) {
                    this.isGameOver = true;
                    const event = new Event('gameOver');
                    window.dispatchEvent(event);
    
                }
            });
            console.log("ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
        
        };
        gsap.to(this.radar.scale, { x: 1, y: 1, z: 1, duration: 3, onComplete: OnScaleComplete });
        this.radar.position.set(boatPos.x, boatPos.y, boatPos.z);
    }

    async releaseKraken() {
        this.attack();
        this.krakenInterval = setInterval(() => {
            this.attack();
        }, 10000);


    }



    update(delta) {
        if (this.fishMixer && this.krakenMixer) {
            this.fishMixer.update(delta * 0.001);
            // this.whaleMixer.update(delta *0.001);
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
        this.kraken.position.copy(this.kraken.body.position);
        // this.kraken.quaternion.copy(this.kraken.body.quaternion);zzz
        if (this.isGameOver) {
            clearInterval(this.krakenInterval);
            this.isGameOver = false;
        }

        // this.entityManager.update(this.yukaTime.update().getDelta());
    }

    reset() {
        this.isKrakenPop = false;
        this.canRemoveBody = false;
        this.isGameOver = false;
        this.krakenInterval = null;
        gsap.set(this.krakenMaterial, { opacity: 0 });
        gsap.set(this.radar.material, { opacity: 0 });
        gsap.set(this.radar.scale, { x: 0.1, y: 0.1, z: 0.1 });
        this.kraken.body.position.set(0, 1, 0);
        // this.krakenMaterial.depthTest = false;
       
    }

}