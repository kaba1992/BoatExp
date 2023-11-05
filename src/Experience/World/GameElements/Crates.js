import Experience from "../../Experience";
import * as THREE from "three";
import * as dat from 'lil-gui'
import { Sine } from "gsap/all";

import { gsap } from "gsap";

import Boat from "./Boat";

const TwoPI = Math.PI * 2;
const scoreDisplay = document.querySelector(".score_display");


export default class Crate {

    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.params = params;
        this.gui = new dat.GUI();
        // this.cameraUi = this.gui.addFolder('camera')
        this.clock = new THREE.Clock();
        this.crate = null
        this.crateArr = [];
        this.badCrateArr = [];
        this.crateSlots = [];
        this.score = 0;
        this.crateModel = this.resources.items.crateModel
        this.crateSlotModel = this.resources.items.crateSlotModel
        this.physic = this.experience.physic;
        this.boat = params.boat;
        this.counter = 0;
        this.slotIndex = 0;
        this.octree = this.experience.octree;
        this.crateSlot = this.crateSlotModel.scene;

        // this.crateSlot.traverse((child) => {
        //     if(child.name.startsWith('crateSlot')) {
        //         this.crateSlots.push(child);
        //         child.scale.set(0.5, 0.5, 0.5);

        //     }
        // });
        // this.setRock();
        this.setCrate();

    }


    setCrate() {
        this.crate = this.crateModel.scene;
        this.boat.traverse((child) => {
            if (child.name.startsWith('crateSlot')) {
                this.crateSlots.push(child);
                // child.scale.set(0.5, 0.5, 0.5);
            }
        });
        console.log(this.crateSlots.length);

        const crateNumb = 100;
        const crateBase = new THREE.TextureLoader().load('/textures/Crate/crateBase.jpg');
        const crateNormal = new THREE.TextureLoader().load('/textures/Crate/crateNormal.png');
        const crateMaterialParams = new THREE.TextureLoader().load('/textures/Crate/crateMaterialParams.png');
        const crateGeometry = this.crate.children[0].geometry;

        const crateMaterial = new THREE.MeshStandardMaterial({
            map: crateBase,
            normalMap: crateNormal,
            aoMap: crateMaterialParams,
            roughnessMap: crateMaterialParams,
            metalnessMap: crateMaterialParams,
            transparent: true,
            // opacity: 0.5,
        });
        /// wrap texture
        crateBase.wrapS = THREE.RepeatWrapping;
        crateBase.wrapT = THREE.RepeatWrapping;
        crateNormal.wrapS = THREE.RepeatWrapping;
        crateNormal.wrapT = THREE.RepeatWrapping;
        crateMaterialParams.wrapS = THREE.RepeatWrapping;
        crateMaterialParams.wrapT = THREE.RepeatWrapping;
        // flip texture
        crateBase.flipY = false;
        crateNormal.flipY = false;
        crateMaterialParams.flipY = false;


        for (let i = 0; i < crateNumb; i++) {

            const crate = new THREE.Mesh(crateGeometry, crateMaterial);
            crate.scale.set(0.05, 0.05, 0.05);
            const angle = Math.random() * Math.PI * 2;

            // set distance between crates
            const distanceBetweenEachCratesAngle = 2 * TwoPI;
            const radius = 10 + Math.random() * 30 * distanceBetweenEachCratesAngle;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = Math.random() * Math.PI * 2;

            crate.position.set(x, -0.2, z);
            crate.userData.initFloating = Math.random() * Math.PI * 2;
            this.crateArr.push(crate);
            this.scene.add(crate);
            // console.log(crate.position);
            // octree.add(crate)
        }


    }

    animateCrateToBoat(crate, index) {
        const crateWorldPosition = new THREE.Vector3();
        crate.getWorldPosition(crateWorldPosition);

        const initialCratePosition = crateWorldPosition.clone();
        // Pourcentage de progression le long de la courbe
        let progress = 0;
        let end = null;
        let controlPoint1 = null;
        let controlPoint2 = null;
        const crateSlots = this.crateSlots;
        const scene = this.scene;

        const gsapTimeline = gsap.timeline()
        gsapTimeline.to(progress, {
            duration: 2,
            value: 1,
            // delay: 0.5,
            ease: "circ.out",
        })
       
        // on update
        gsapTimeline.eventCallback("onUpdate", function () {
            progress = gsapTimeline.progress();
            const slotWorldPosition = new THREE.Vector3();
            crateSlots[index].getWorldPosition(slotWorldPosition);
            // Point d'arrivée: position sur le bateau 
            end = slotWorldPosition;
            // Points de contrôle pour définir la courbure
            controlPoint1 = new THREE.Vector3(initialCratePosition.x + 0.8, initialCratePosition.y + 0.60, initialCratePosition.z + 0.8);
            controlPoint2 = new THREE.Vector3(end.x - 0.16, end.y + 0.1, end.z);
            const curve = new THREE.CubicBezierCurve3(initialCratePosition, controlPoint1, controlPoint2, end);
            const newPos = curve.getPoint(progress);
            crate.position.copy(newPos);
        })
        gsapTimeline.eventCallback("onComplete", function () {
            crateSlots[index].add(crate);
            crate.position.copy(crateSlots[index].position);
            crate.scale.set(0.08, 0.08, 0.08);
            if(index >= crateSlots.length - 1){
                //remove crate
                // scene.remove(crate);
                console.log("remove crate");
            }
        })
    }

    initFloating(objects, time) {
        objects.forEach((object) => {
            object.position.y = Math.sin(time) * 0.05 - 0.2;
            object.rotation.y += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.x += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.z += Math.sin(object.userData.initFloating + time) * 0.001;
        });
    }
    scoreManager() {
        this.counter++
        this.crateArr.forEach((crate, index) => {
            const boatWorldPosition = new THREE.Vector3();
            this.boat.getWorldPosition(boatWorldPosition);
            // console.log(boatWorldPosition );
            if (boatWorldPosition.distanceTo(crate.position) <= 3) {
                crate.rotation.set(0, 0, 0);
                this.score += 1;
                this.animateCrateToBoat(crate, this.slotIndex % this.crateSlots.length);
                this.slotIndex++;
                // remove in array
                this.crateArr.splice(index, 1);
                
                this.counter = 0;
            }
        })

        scoreDisplay.innerHTML = `X ${this.score}`;
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();
        this.initFloating(this.crateArr, elapsedTime);
        // log crateslot position
        this.crateSlots.forEach((crateSlot) => {
            const crateSlotWorld = new THREE.Vector3();
            crateSlot.getWorldPosition(crateSlotWorld);
        });
        this.scoreManager();

    }
}