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
        console.log(this.resources);

        this.setRock();
    }

    setRock() {
        
        console.log(this.rock);


    }

    update() {

        console.log('hello world');
    }
}