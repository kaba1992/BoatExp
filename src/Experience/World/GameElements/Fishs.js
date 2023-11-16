//"Clown fish" (https://skfb.ly/PXsC) by rubykamen is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
//"Blue Whale - Textured" (https://skfb.ly/67RFV) by Bohdan Lvov is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as YUKA from 'yuka';
import * as THREE from 'three';
import Experience from "../../Experience";

export default class Fishs {
    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.fishModel;
        this.whaleResource = this.resources.items.whaleModel;
        this.time = this.experience.time;
        this.camera = this.experience.camera.instance;
        this.entityManager = new YUKA.EntityManager();
        this.yukaTime = new YUKA.Time();

        this.fishs = [];
        this.setFishs();
        // this.setWhales();

    }

    setFishs() {
        this.fish = this.resource.scene.children[0];
     
        this.scene.add(this.fish);
        this.fish.position.set(0, -2.6, 0);
        this.fish.scale.set(2, 2, 2);
        
       
     
        const clips = this.resource.animations;
        console.log(clips);
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
        console.log(clips);
        const whales = new THREE.AnimationObjectGroup();
        this.whaleMixer = new THREE.AnimationMixer(this.whale);
        const clip = THREE.AnimationClip.findByName(clips, "Swimming");
        const action = this.whaleMixer.clipAction(clip);
        action.play();

    }

    update(delta){
        if(this.fishMixer){
            this.fishMixer.update(delta *0.001);
            // this.whaleMixer.update(delta *0.001);
        }
        // this.entityManager.update(this.yukaTime.update().getDelta());
    }

}