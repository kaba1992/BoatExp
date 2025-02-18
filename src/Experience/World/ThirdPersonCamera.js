import Experience from "../Experience";
import * as THREE from "three";
import gsap from "gsap";

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
        this.canUpdate = false;
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.clock = new THREE.Clock();

        this.params = {
            x: 5,
            y: 3,
            z: -5,
        }
        window.addEventListener('startExp', () => {
            this.canUpdate = true;
       
            gsap.to(this.params, {
                x: 0,
                y: 5,
                z: -7,
                duration: 5,
                // ease: "power2.inOut",
            })
        });

    }
    calculateIdealOffset() {

        // convert target rotation from euler to quaternion
        const targetRotation = new THREE.Quaternion();
        const camRot = new THREE.Euler(0, this.target.rotation.y, 0);
        targetRotation.setFromEuler(camRot);

        const idealOffset = new THREE.Vector3(this.params.x, this.params.y, this.params.z);
        idealOffset.applyQuaternion(targetRotation);

        idealOffset.add(this.target.position);
        // this.cameraUi.add(params, 'x', -100, 100, 0.1).onChange(() => { idealOffset.x = params.x })
        // this.cameraUi.add(params, 'y', -100, 100, 0.1).onChange(() => { idealOffset.y = params.y })
        // this.cameraUi.add(params, 'z', -100, 100, 0.1).onChange(() => { idealOffset.z = params.z })


        return idealOffset;
    }
    calculateIdealLookAt() {
        // convert target rotation from euler to quaternion
        const targetRotation = new THREE.Quaternion();
        const camRot = new THREE.Euler(0, this.target.rotation.y, 0);
        targetRotation.setFromEuler(camRot);
        const idealLookAt = new THREE.Vector3(0, 3, 0);
        idealLookAt.applyQuaternion(targetRotation);
        idealLookAt.add(this.target.position);
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
        // if(this.canUpdate){
        this.currentPosition.lerp(idealOffset, lerpPow);
        this.currentLookAt.lerp(idealLookAt, lerpPow);
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        // }



    }
}