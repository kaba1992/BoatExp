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

        for (let i = 0; i < this.rocks.length; i++) {

            this.scene.add(this.rocks[i]);
            this.rocks[i].position.x = Math.random() * 1000 + i;
            this.rocks[i].position.y = Math.random() * 1000 + i;
            this.rocks[i].position.z = Math.random() * 1000 + i;

        }
    }

    update() {

        console.log('hello world');
    }
}