import Experience from "../Experience";
import * as THREE from "three";
import * as dat from 'lil-gui'

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
        this.crateArr = [];
        this.model = this.resources.items.rockModel2
        this.crateModel = this.resources.items.crateModel
        this.setRock();
        this.setCrate();
     

    }

    setRock() {

        this.rocks = this.model.scene.children[0].children[0].children[0].children;
        const rockNumber = 20;
        for (let i = 0; i < this.rocks.length; i++) {
            for (let j = 0; j < rockNumber; j++) {
                this.rock = this.rocks[i].clone();
                const angle = Math.random() * Math.PI * 2;
                const radius = 200 + Math.random() * 1500;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = 0
                const rock = this.rock;
                rock.position.set(x, y, z);
                rock.scale.set(5, 5, 5);
                this.scene.add(rock);
                // rock.visible = false;
            }


        }
    }

    setCrate() {
        this.crates = this.crateModel.scene.children[0].children[0].children[0].children;
        const crateNumb = 8;
        for (let i = 0; i < this.crates.length; i++) {
            for (let j = 0; j < crateNumb; j++) {
                this.crate = this.crates[i].clone();
                this.crate.scale.set(0.05, 0.05, 0.05);
                const angle = Math.random() * Math.PI * 2;

                // set distance between crates
                const distanceBetweenEachCratesAngle = 10 * Math.PI * 2;
                const radius = 50 + Math.random() * 500 + j * distanceBetweenEachCratesAngle;
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;
                const y = Math.random() * Math.PI * 2;
                this.crate.position.set(x, y, z);
                this.crate.userData.initFloating = Math.random() * Math.PI * 2;
                this.crateArr.push(this.crate);
                this.scene.add(this.crate);

            }
        }


    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();
        this.crateArr.forEach((crate) => {
            crate.position.y = Math.sin(crate.userData.initFloating + elapsedTime) * 1;
            crate.rotation.y += Math.sin(crate.userData.initFloating + elapsedTime) * 0.001;
            crate.rotation.x += Math.sin(crate.userData.initFloating + elapsedTime) * 0.001;
            crate.rotation.z += Math.sin(crate.userData.initFloating + elapsedTime) * 0.001;

        });
    }
}