import Experience from "../../Experience";
import * as THREE from "three";

import { gsap } from "gsap";
const scoreDisplay = document.querySelector(".score_display");


export default class Crate {

    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.timer = this.experience.timer;
        this.params = params;
        // this.gui = new dat.GUI();
        // this.cameraUi = this.gui.addFolder('camera')
        this.clock = new THREE.Clock();
        this.crate = null
        this.crates = [];
        this.crateArr = [];
        this.crateSlots = [];
        window.score = 0;
        this.crateModel = this.resources.items.crateModel
        this.crateSlotModel = this.resources.items.crateSlotModel
        this.physic = this.experience.physic;
        this.boat = params.boat;
        this.counter = 0;
        this.slotIndex = 0;
        this.crateSlot = this.crateSlotModel.scene;
        this.setCrate();

        window.addEventListener('reset', () => {
            this.reset(params);
        });

    }

    loadTextureAsync(path) {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(path, resolve, undefined, reject);
        });
    }


    async setCrate() {
        this.crate = this.crateModel.scene;
        this.boat.traverse((child) => {
            if (child.name.startsWith('crateSlot')) {
                this.crateSlots.push(child);
                // child.scale.set(0.5, 0.5, 0.5);
            }
        });


        // const crateNumb = 100;
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

        const gridSize = 10; // 10x10 grille
        const crateInterval = 30; // Espace de 2 unités entre chaque caisse
        const crateNumb = gridSize * gridSize; // Nombre total de caisses
        const randomOffset = 10;
        let crateCreationPromises = [];
        for (let i = 0; i < crateNumb; i++) {
            let promise = new Promise((resolve, reject) => {
                const crate = new THREE.Mesh(crateGeometry, crateMaterial);
                crate.scale.set(0.05, 0.05, 0.05);

                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                const x = col * crateInterval - (gridSize * crateInterval) / 2 + (Math.random() - 0.5) * randomOffset;
                const z = row * crateInterval - (gridSize * crateInterval) / 2 + (Math.random() - 0.5) * randomOffset;

                crate.position.set(x, -0.2, z);
                crate.userData.initFloating = Math.random() * Math.PI * 2;
                this.crateArr.push(crate);
                this.crates.push(crate);
                this.scene.add(crate);
                resolve(crate);
            });
            crateCreationPromises.push(promise);
        }
        await Promise.all(crateCreationPromises);
        console.log("all crates loaded");
     
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
            if (index > crateSlots.length - 1) {
                this.scene.remove(crate);
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
                window.score += 1;
                this.animateCrateToBoat(crate, this.slotIndex % this.crateSlots.length);
                this.slotIndex++;
                // remove in array
                this.crateArr.splice(index, 1);
                this.timer.incrementTimer(10000);

                this.counter = 0;
            }
        })

        scoreDisplay.innerHTML = `X ${window.score}`;
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

    reset(params) {
        this.crates.forEach((crate) => {
            crate.geometry.dispose();
            crate.material.dispose();
            this.scene.remove(crate);
        });
        this.crateSlots.forEach((crateSlot) => {
            crateSlot.remove(crateSlot.children[0]);
        });
        window.score = 0;
        this.slotIndex = 0;
        this.counter = 0;
        this.crateArr = [];
        this.crateSlots = [];
        this.setCrate();

    }
}