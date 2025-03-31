import { MeshBasicMaterial, VideoTexture, AnimationMixer, LoopRepeat, DoubleSide, LinearFilter, NearestFilter } from 'three';
import gsap from 'gsap';

class BirdMove {
    constructor(group, glb) {
        this.group = group
        this.glb = glb.scene
        this.glb.scale.set(0.3, 0.3, 0.3)

        this.animations = glb.animations
        this.videos = []
        this.materials = []
        // Start animations
        this.mixer = new AnimationMixer(this.glb);
        this.clips = this.animations;
        this.clips.forEach((clip) => {
            const action = this.mixer.clipAction(clip)
            action.clampWhenFinished = true;
            action.setLoop(LoopRepeat)
            // Jouer l'animation
            action.play();
        });
        // Start functions
        this.setup()
        this.addEvents()
    }
    setup() {
        this.glb.traverse((child) => {
            if (child.isMesh) {
                child.layers.enable(1);
                child.layers.disable(0);

                this.video = document.createElement('video');
                this.video.crossOrigin = "anonymous";
                this.video.playsInline = "true";
                this.video.webkitPlaysInline = "true";
                this.video.loop = true;
                this.video.autoplay = true;
                this.video.needsUpdate = true
                this.video.muted = true;
                this.video.controls = false;
                this.video.style.display = 'none';
                let source = document.createElement('source');
                switch (child.name) {
                    case "Plane004":
                        source.src = "textures/Videos/oie-1-loop.mp4";

                        break;
                    case "Plane006":
                        source.src = "textures/Videos/oie-2-loop.mp4";

                        break;
                    case "Plane008":
                        source.src = "textures/Videos/oie-3-loop.mp4";

                        break;
                }
                source.type = 'video/mp4';
                this.video.appendChild(source);
                this.videos.push({ video: this.video, videoActivated: false })
                this.texture = new VideoTexture(this.video)
                this.texture.minFilter = LinearFilter;
                this.texture.magFilter = LinearFilter;
                this.texture.needsUpdate = true;
                this.texture.anisotropy = 0;
                this.texture.magFilter = NearestFilter;
                this.texture.minFilter = NearestFilter;
                child.material = new MeshBasicMaterial({
                    map: this.texture,
                    alphaMap: this.texture,
                    side: DoubleSide,
                    transparent: true,
                    opacity: 0,
                    toneMapped: false,
                    depthWrite: false,
                    depthTest: false,
                    // blending: NormalBlending,
                })
                this.materials.push(child.material)
            }
        })
    
        this.group.add(this.glb)
    }
    fadeBird() {
        this.materials.forEach(material => {
            gsap.to(material, {
                delay: 2.5,
                opacity: 1,
                duration: 2,
            });
        })
    }

    setPosition(x, y, z) {
        this.glb.position.set(x, y, z)
    }
    update(time) {
        this.mixer.update(time * 0.0008);
    }
    addEvents() {
        window.addEventListener('click', () => {
            this.videos.forEach(video => {
                if (video.videoActivated === false) {
                    video.videoActivated = true
                    const randomDelay = Math.random() * 3000;
                    setTimeout(() => {
                        video.video.load()
                        video.video.play();
                       
                        
                    }, randomDelay);
                    this.fadeBird()
                }
            })
        })
    }
}
export default BirdMove;