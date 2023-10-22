import Experience from "../Experience";
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'


export default class ThirdPersonCamera {
    static group;
    constructor(params) {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.renderer = this.experience.renderer.instance;
        this.world = this.experience.world;
        this.params = params;
        this.camera = params.camera;
        this.target = params.target;

        this.gui = new dat.GUI();
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.cameraUi = this.gui.addFolder('camera')
        this.clock = new THREE.Clock();
        // this.idealOffset = new Vector3(150, 20, 0);
        // Container for both camera and person
        this.container = new THREE.Group();
        this.scene.add(this.container);
        // get camera X  axis
        this.xAxis = new THREE.Vector3(1, 0, 0);
        this.tempCameraVector = new THREE.Vector3();
        this.tempTargetVector = new THREE.Vector3();
        this.cameraOriginPoint = new THREE.Vector3(0, 2, 0);
        this.camera.lookAt(this.cameraOriginPoint);
        this.container.add(this.camera);
        this.container.add(this.target);
        this.container.position.set(0, 0.05, 0);
        this.speed = params.speed || 0.04;
        this.maxSpeed = 0.1;
        this.maxForce = 0.01;
        this.velocity = new THREE.Vector3();
        this.desired = new THREE.Vector3();
        this.steer = new THREE.Vector3();
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.bootWheel = this.target.getObjectByName('volant')
        this.movingForward = false;
        this.mouseDown = false;
        this.mouseEvents();

    }

  
    mouseEvents() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "z") {
                // this.movingForward = true;
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "z") {
                this.movingForward = false;
            }
        });

        window.addEventListener("pointerdown", (e) => {
            this.controls.lock();

            this.mouseDown = true;
            this.movingForward = true;

        });

        window.addEventListener("pointerup", (e) => {
            this.mouseDown = false;
            this.movingForward = false;

        });

        window.addEventListener("pointermove", (e) => {
            // hide mouse arrow
            this.renderer.domElement.style.cursor = "none";

            // if (this.mouseDown) {
            const { movementX, movementY } = e;
            const offset = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.cameraOriginPoint));
            // lerp camera position
            const phi = 15;

            offset.theta -= movementX * 0.0008;
            // make sure camera doesn't move on
            offset.phi = Math.max(0.01, Math.min(0.35 * Math.PI, phi));
            offset.radius = 5;
            // this.camera.position.copy(this.cameraOriginPoint.clone().add(new THREE.Vector3().setFromSpherical(offset)));
            // lerp camera position
            this.camera.position.lerp(this.cameraOriginPoint.clone().add(new THREE.Vector3().setFromSpherical(offset)), 0.3);
            // console.log("camera position", this.container.position);
            // };


            // console.log("camera position", this.camera.position);
            // this.camera.lookAt(this.container.position.clone().add(this.cameraOriginPoint));
        });

    }

    getWordInfo() {
        if (this.movingForward) {
           
            //get direction where camera is looking  to move boat at that direction    
            this.camera.getWorldDirection(this.tempCameraVector);
            // lock camera Y axis
            const directionCam = this.tempCameraVector.setY(0).normalize();

            // get direction where boat is looking  to compare with camera direction
            this.target.getWorldDirection(this.tempTargetVector);
            // lock boat Y axis 
            const targetDirection = this.tempTargetVector.setY(0).normalize();

            // get angle between camera direction and x axis tocompare if angle is anti-clockwise or clockwise
            const cameraAngle = directionCam.angleTo(this.xAxis) * (directionCam.z > 0 ? 1 : -1);
            const targetAngle = targetDirection.angleTo(this.xAxis) * (targetDirection.z > 0 ? 1 : -1);

            //Get the angle to rotate the boat to face the camera Clockwise positive
            const angleToRotate = targetAngle - cameraAngle;

            // get the shortest angle from clockwise to ensure the boat rotates shortest Angle
            let shortestAngle = angleToRotate;
            if (angleToRotate > Math.PI) {
                shortestAngle = angleToRotate - 2 * Math.PI;
            }
            if (angleToRotate < -Math.PI) {
                shortestAngle = angleToRotate + 2 * Math.PI;
            }

            // rotate boat to face camera direction
            // use slerp to smooth rotation
            // this.target.quaternion.slerp(new Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), shortestAngle), 0.1);

            this.target.rotateY(Math.max(-0.05, Math.min(shortestAngle, 0.05)));
            this.bootWheel.rotateZ(Math.max(-0.05, Math.min(shortestAngle, 0.05)));


            this.container.position.add(directionCam.multiplyScalar(this.speed));
       

        }
        this.camera.lookAt(this.container.position.clone().add(this.cameraOriginPoint));


    }

    update() {
        this.getWordInfo();
    }
}