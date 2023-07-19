import Experience from "../Experience";
import { Clock, Vector3 } from "three";
import * as dat from 'lil-gui'
import AddBody from '../Utils/addBody.js';
import bodyTypes from "../Utils/BodyTypes.js";
import Boat from "./Boat";

const TwoPI = Math.PI * 2;
const scoreDisplay = document.querySelector(".score_display");
const vector1 = new Vector3();
const vector2 = new Vector3();
const vector3 = new Vector3();

export default class Rock {

    constructor(params) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.params = params;
        this.water = params.water;
        this.gui = new dat.GUI();
        this.cameraUi = this.gui.addFolder('camera')
        this.clock = new Clock();
        this.rock = null
        this.crate = null
        this.goodCrateArr = [];
        this.badCrateArr = [];
        this.score = 0;
        this.model = this.resources.items.rockModel2
        this.crateModel = this.resources.items.crateModel
        this.physic = this.experience.physic;
        this.boatBody = Boat.modelBody;
        this.boat = Boat;
        this.counter = 0;
        this.rocksArr = []
        this.octree = this.experience.octree;
        // this.setRock();
        // this.setCrate();

    }

    setRock() {
        this.rocks = this.model.scene.children[0].children[0].children[0].children;
        this.rocksToRemove = ["Rock_9", "Rock_10", "Rock_11", "Rock_12", "Rock_13"]
        this.rocks = this.rocks.filter(rock => !this.rocksToRemove.includes(rock.name))

        const rockNumber = 22;
        for (let i = 0; i < this.rocks.length; i++) {
            for (let j = 0; j < rockNumber; j++) {
                this.rock = this.rocks[i].clone();
                const angle = Math.random() * Math.PI * 2;
                const distanceBetweenEachRockAngle = 10 * TwoPI;
                const radius = 200 + Math.random() * 2000 + j * distanceBetweenEachRockAngle;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = 0;

                this.rock.position.set(x, y, z);
                this.rock.scale.set(10, 10, 10);
                // this.scene.add(this.rock);
                // this.octree.add(this.rock)

                this.rocksArr.push({ rock: this.rock, velocity: new Vector3() });
                this.rock.traverse(child => {
                    if (child.isMesh) {
                        this.octree.add(child)
                    }
                })

                // this.rock.body = AddBody.setBody(
                //     this.rock,
                //     10000,
                //     {
                //         fixedRotation: true,
                //         collisionFilterGroup: bodyTypes.ROCK,
                //         collisionFilterMask: bodyTypes.BOAT

                //     },
                //     this.physic.world,
                // )

                // rock.visible = false;
            }


        }
    }





    setCrate() {
        this.crates = this.crateModel.scene.children[0].children[0].children[0].children;
        const crateNumb = 16;
        const goodCrates = this.crates.filter(crate => crate.name === "barrel" || crate.name === "crate")
        const badCrates = this.crates.filter(crate => crate.name === "barrelbroken" || crate.name === "cratebroken")
        const addCrate = ({ crates, crate, crateArr, scene, octree }) => {
            for (let i = 0; i < crates.length; i++) {
                for (let j = 0; j < crateNumb; j++) {
                    crate = crates[i].clone();
                    crate.scale.set(0.05, 0.05, 0.05);
                    const angle = Math.random() * Math.PI * 2;

                    // set distance between crates
                    const distanceBetweenEachCratesAngle = 10 * TwoPI;
                    const radius = 200 + Math.random() * 1500 + j * distanceBetweenEachCratesAngle;
                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;
                    const y = Math.random() * Math.PI * 2;
                    crate.traverse(child => {
                        if (child.isMesh) {
                            this.octree.add(child)
                        }
                    })
                    crate.position.set(x, y, z);
                    crate.userData.initFloating = Math.random() * Math.PI * 2;
                    crateArr.push(crate);
                    scene.add(crate);
                    // octree.add(crate)
                }
            }
        }

        // addCrate({
        //     crates: goodCrates,
        //     // crate: this.goodCrate,
        //     crateArr: this.goodCrateArr,
        //     scene: this.scene,
        //     // octree: this.octree
        // })
        // addCrate({
        //     crates: badCrates,
        //     // crate: this.badCrate,
        //     crateArr: this.badCrateArr,
        //     scene: this.scene,
        //     // octree: this.octree
        // })

    }

    // function spheresCollisions() {

    // 	for ( let i = 0, length = spheres.length; i < length; i ++ ) {

    // 		const s1 = spheres[ i ];

    // 		for ( let j = i + 1; j < length; j ++ ) {

    // 			const s2 = spheres[ j ];

    // 			const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
    // 			const r = s1.collider.radius + s2.collider.radius;
    // 			const r2 = r * r;

    // 			if ( d2 < r2 ) {

    // 				const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
    // 				const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
    // 				const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

    // 				s1.velocity.add( v2 ).sub( v1 );
    // 				s2.velocity.add( v1 ).sub( v2 );

    // 				const d = ( r - Math.sqrt( d2 ) ) / 2;

    // 				s1.collider.center.addScaledVector( normal, d );
    // 				s2.collider.center.addScaledVector( normal, - d );

    // 			}

    // 		}

    // 	}

    // }
    rockCollision() {
        const boatPos = this.boat.model.position;

        for (let i = 0; i < this.rocksArr.length; i++) {
            const rock = this.rocksArr[i].rock;
            const rockPos = this.rocksArr[i].rock.position;
            const distance = rockPos.distanceTo(boatPos);

            if (distance < 100) {
                const normal = vector1.subVectors(rockPos, boatPos).normalize();
                const d = (100 - distance) / 2;
                boatPos.addScaledVector(normal, -d);

            }
        }
    }
    initFloating(objects, time) {
        objects.forEach((object) => {
            object.position.y = Math.sin(object.userData.initFloating + time) * 1;
            object.rotation.y += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.x += Math.sin(object.userData.initFloating + time) * 0.001;
            object.rotation.z += Math.sin(object.userData.initFloating + time) * 0.001;
        });

    }
    scoreManager() {
        this.counter++

        this.goodCrateArr.forEach((crate, index) => {
            if (this.boatBody.position.distanceTo(crate.position) <= 25) {
                this.score += 1;
                this.scene.remove(crate);
                // remove in array
                this.goodCrateArr.splice(index, 1);
                this.counter = 0;
            }
        })

        this.badCrateArr.forEach((crate, index) => {
            if (this.boatBody.position.distanceTo(crate.position) <= 25) {
                this.score -= 1;
                this.scene.remove(crate);
                // remove in array
                this.badCrateArr.splice(index, 1);
            }
        })
        scoreDisplay.innerHTML = this.score;
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();
        this.initFloating(this.goodCrateArr, elapsedTime);
        this.initFloating(this.badCrateArr, elapsedTime);
        this.scoreManager();
        this.rockCollision();
        // this.rocksArr.forEach(rock => {
        //     rock.body.position.copy(rock.position)
        //     rock.body.quaternion.copy(rock.quaternion)
        // })
    }
}