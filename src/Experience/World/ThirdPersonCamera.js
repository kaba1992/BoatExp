import Experience from "../Experience";
import * as THREE from "three";
import * as dat from 'lil-gui'

export default class ThirdPersonCamera {
    constructor(params) {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.renderer = this.experience.renderer.instance;
        this.world = this.experience.world;
        this.params = params;
        this.camera = params.camera;
        this.target = params.target;
        // this.gui = new dat.GUI();
        this.time = this.experience.time;
        this.idealOffsetPos = {
            x: 0,
            y: 5,
            z: -8,
        }
        this.currentPosition = this.calculateIdealOffset();
        this.currentLookAt = this.calculateIdealLookAt();
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        // this.cameraUi = this.gui.addFolder('camera')
        this.clock = new THREE.Clock();
      
        window.addEventListener("reset", () => {
            this.reset();
        });


    }
    calculateIdealOffset() {
    // Convertir la rotation de la cible de Euler en Quaternion
    const targetQuaternion = this.target.body.quaternion;

    // Créer le vecteur de décalage idéal
    const idealOffset = new THREE.Vector3(this.idealOffsetPos.x, this.idealOffsetPos.y, this.idealOffsetPos.z);
    
    // Appliquer la rotation de la cible au décalage
    idealOffset.applyQuaternion(targetQuaternion);

    // Ajouter la position de la cible au décalage pour obtenir la position finale
    idealOffset.add(this.target.position);

    return idealOffset;
}
    calculateIdealLookAt() {
        // convert target rotation from euler to quaternion
        const targetRotation = new THREE.Quaternion();
        // const camRot = new THREE.Euler(0, this.target.rotation.y, 0);
        // targetRotation.setFromEuler(camRot);
        const idealLookAt = new THREE.Vector3(0, 3, 0);
        idealLookAt.applyQuaternion(this.target.body.quaternion);
        idealLookAt.add(this.target.body.position);
        return idealLookAt;
    }


    update() {
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        // const lerpPow = 3.0 * delta;
        const lerpPow = 1.0 - Math.pow(0.05, delta);
        const idealOffset = this.calculateIdealOffset();
        const idealLookAt = this.calculateIdealLookAt();
        // fill these in
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        this.currentPosition.lerp(idealOffset, lerpPow);
        this.currentLookAt.lerp(idealLookAt, lerpPow);
       
    }
async reset() {
        
    // await new Promise(r => setTimeout(r, 200));

   const idealOffset = this.calculateIdealOffset();
   const idealLookAt = this.calculateIdealLookAt();


   this.currentPosition.copy(idealOffset);
   this.currentLookAt.copy(idealLookAt);


   this.camera.position.copy(this.currentPosition);
   this.camera.lookAt(this.currentLookAt);
    }
}