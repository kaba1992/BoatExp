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
        this.model = this.resources.items.rockModel2
        this.setRock();
    }

    setRock() {

        this.rocks = this.model.scene.children[0].children[0].children[0].children;
        const rockNumber = 20;
        for (let i = 0; i < this.rocks.length; i++) {
            for (let j = 0; j < rockNumber; j++) {
                this.rock = this.rocks[i].clone();
                const angle = Math.random() * Math.PI * 2;
                const radius = 100 + Math.random() * 1500;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = 0
                const rock = this.rock;
                rock.position.set(x, y, z);
                rock.scale.set(5, 5, 5);
                this.scene.add(rock);


            }


        }
    }

    update() {

        console.log('hello world');
    }
}