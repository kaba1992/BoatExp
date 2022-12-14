import Experience from "../Experience";
import * as THREE from "three";
import * as dat from 'lil-gui'
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";

export default class Rock {
    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.params = params;
        this.water = params.water;
        this.gui = new dat.GUI();
        this.cameraUi = this.gui.addFolder('camera')
        this.clock = new THREE.Clock();
        this.rock = null
        this.crate = null
        this.goodCrateArr = [];
        this.badCrateArr = [];
        this.goodCrate = null;
        this.badCrate = null;
        this.model = this.resources.items.rockModel2
        this.crateModel = this.resources.items.crateModel
        this.physic = this.experience.physic;
        this.setRock();
        this.setCrate();


    }

    setRock() {

        this.rocks = this.model.scene.children[0].children[0].children[0].children;
        this.rocksToRemove = ["Rock_9", "Rock_10", "Rock_11", "Rock_12", "Rock_13"]
        this.rocks = this.rocks.filter(rock => !this.rocksToRemove.includes(rock.name))
        console.log(this.rocks.length);
        const rockNumber = 22;
        for (let i = 0; i < this.rocks.length; i++) {
            for (let j = 0; j < rockNumber; j++) {
                this.rock = this.rocks[i].clone();
                const angle = Math.random() * Math.PI * 2;
                const distanceBetweenEachRockAngle = 10 * Math.PI * 2;
                const radius = 200 + Math.random() * 2000 + j * distanceBetweenEachRockAngle;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = 6

                this.rock.position.set(x, y, z);
                this.rock.scale.set(10, 10, 10);
                this.scene.add(this.rock);

                this.rockBody = AddBody.setBody(
                    this.rock,
                    0,
                    {
                        fixedRotation: true,
                        collisionFilterGroup: bodyTypes.ROCK,
                    },
                    this.physic.world,
                )
                this.rockBody.position.copy(this.rock.position);
                this.rockBody.quaternion.copy(this.rock.quaternion);

                // rock.visible = false;
            }


        }
    }





    setCrate() {
        this.crates = this.crateModel.scene.children[0].children[0].children[0].children;
        const crateNumb = 8;
        const goodCrates = this.crates.filter(crate => crate.name === "barrel" || crate.name === "crate")
        const badCrates = this.crates.filter(crate => crate.name === "barrelbroken" || crate.name === "cratebroken")
        function addCrate({ crates, crate, crateArr, scene }) {
            for (let i = 0; i < crates.length; i++) {
                for (let j = 0; j < crateNumb; j++) {
                    crate = crates[i].clone();
                    crate.scale.set(0.05, 0.05, 0.05);
                    const angle = Math.random() * Math.PI * 2;

                    // set distance between crates
                    const distanceBetweenEachCratesAngle = 10 * Math.PI * 2;
                    const radius = 200 + Math.random() * 1500 + j * distanceBetweenEachCratesAngle;
                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;
                    const y = Math.random() * Math.PI * 2;
                    crate.position.set(x, y, z);
                    crate.userData.initFloating = Math.random() * Math.PI * 2;
                    crateArr.push(crate);
                    scene.add(crate);

                }
            }
        }
        addCrate({
            crates: goodCrates,
            crate: this.goodCrate,
            crateArr: this.goodCrateArr,
            scene: this.scene
        })
        addCrate({
            crates: badCrates,
            crate: this.badCrate,
            createArr: this.badCrateArr,
            scene: this.scene
        })

    }

    initFloating(objects, time) {
        objects.forEach((object) => {
            object.position.y = Math.sin(object.userData.initFloating + time) * 1;
            object.rotation.y += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.x += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.z += Math.sin(object.userData.initFloating + time) * 0.001;
        });

    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();
        this.initFloating(this.goodCrateArr, elapsedTime);
        this.initFloating(this.badCrateArr, elapsedTime);

    }
}