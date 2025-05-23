import '../UI/Home.css'
import EventEmitter from '../Experience/Utils/EventEmitter.js'
import Experience from '../Experience/Experience'
import gsap from 'gsap';


const dialogues = [
    "Hello young Rookie, welcome to 'Sea Of Sharks'. I am Captain Flyn, and I need your help!",
    "My cargo was lost at sea and half of my crew was eaten by sharks",
    "Your job is to bring me back my supplies.Avoid the sharks and Krakensama.",
    "Be carefull, the sharks are still roaming around us. Good luck rookies and may the best win !",
];

export default class Home extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.uiManager = this.experience.uiManager;
        this.timer = this.experience.timer;
        this.ranking = this.experience.ranking;

        this.homeClicked = new Event('homeClicked');

        this.uiManager.hide('#root');
        this.soundDom = document.querySelector(".sound")
        this.gameOverScore = document.querySelector(".gameOver-score")
        this.uiManager.hide(".dialogue-text-container1");
        this.uiManager.hide(".dialogue");
        this.uiManager.hide(".gameOverContainer");
        this.uiManager.hide(".movement-hint");
        this.uiManager.hide(".score");
        this.uiManager.hide(".timer ");
        this.uiManager.hide(".aditional-time");
        this.loopAudio = new Audio('Audios/Ambiance/AmbianceLoop.wav');
        this.loopAudio.loop = true;
        this.loopAudio.volume = 0.2;
        this.dialogue1AUDIO = new Audio('Audios/Dialogues/Dialogue1Audio.mp3');
        this.dialogue2AUDIO = new Audio('Audios/Dialogues/Dialogue2Audio.mp3');
        this.dialogue3AUDIO = new Audio('Audios/Dialogues/Dialogue3Audio.mp3');
        this.dialogue4AUDIO = new Audio('Audios/Dialogues/Dialogue4Audio.mp3');
        this.dialogues = [this.dialogue1AUDIO, this.dialogue2AUDIO, this.dialogue3AUDIO, this.dialogue4AUDIO];

        const text1 = document.querySelector('.dialogue-text-container1');

        this.setListeners(text1);
    }



    setListeners(text1) {
        const readyButton = document.querySelector('.movement-hint-ready');
        const resetButton = document.querySelector('.gameOver-restart');
        const startExpButton = document.querySelector('.startExp');
        const readyEvent = new Event('ready');
        const resetEvent = new Event('reset');
        const startExpEvent = new Event('startExp');


        window.addEventListener('resourcesReady', () => {
            window.dispatchEvent(this.homeClicked);


            this.uiManager.show('#root', true);


        });

        readyButton.addEventListener('click', () => {
            this.uiManager.fadeOut(".movement-hint", 1);
            this.loopAudio.play();
            setTimeout(() => {
                this.timer.startTimer();
                this.uiManager.show(".score", false, "flex");
                this.uiManager.fadeIn(".score", 1);
                this.uiManager.show(".timer", false, "block");
                this.uiManager.fadeIn(".timer", 1);
                window.dispatchEvent(readyEvent);


            }, 1000);
        });

        window.addEventListener('gameOver', () => {
            if (this.ranking.isUserNameStored) {
                this.uiManager.show(".gameOverContainer", false);
                this.uiManager.fadeIn(".gameOverContainer", 1);
                this.gameOverScore.innerHTML =  window.score;
                this.timer.stopDecrementation()
            }

            this.reset();
        });

        window.addEventListener('setUserName', () => {
            this.uiManager.show(".gameOverContainer", false);
            this.uiManager.fadeIn(".gameOverContainer", 1);

        });

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                window.dispatchEvent(resetEvent);
                this.uiManager.fadeOut(".gameOverContainer", 1);
                this.uiManager.show(".movement-hint", false);
                this.uiManager.fadeIn(".movement-hint", 1);
                this.uiManager.fadeOut(".timer", 1);
                this.timer.resetTimer();
            });

        }

        window.addEventListener('revealEnd', async () => {
            this.uiManager.show('#root', true);

            gsap.to(this.soundDom, {
                duration: 1, opacity: 1, ease: "power2.inOut", onComplete: () => {


                }
            })
        });

        startExpButton.addEventListener('click', () => {
            window.dispatchEvent(startExpEvent);
            this.loopAudio.play();
            gsap.to(this.soundDom, {
                duration: 1, opacity: 0, ease: "power2.inOut", onComplete: () => {
                    this.soundDom.style.display = "none";
                    const text1 = document.querySelector('.dialogue-text-container1');
                    this.setDilogues(text1);
                }
            })
        });

    }

    async setDilogues(text1) {
        const dialogueContainer = document.querySelector('.dialogue-text-container1');

        if (this.ranking.isUserNameStored) {
            this.uiManager.show(".movement-hint", false);
            this.uiManager.fadeIn(".movement-hint", 1);
        } else {

            this.uiManager.show(".dialogue-text-container1", false);
            text1.innerHTML = dialogues[0];
            this.uiManager.fadeIn(".dialogue-text-container1", 1);

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.uiManager.show(".dialogue", false);
            this.uiManager.fadeIn(".dialogue", 1);
            this.dialogues[0].play();
            await new Promise(resolve => setTimeout(resolve, 4000));

            for (let i = 0; i < dialogues.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 4000 * i));
                this.uiManager.fadeOut(".dialogue-text-container1", 1);
                await new Promise(resolve => setTimeout(resolve, 1000));
                text1.innerHTML = dialogues[i + 1];
                if (i < dialogues.length - 1) {
                    this.dialogues[i + 1].play();
                }
                this.uiManager.fadeIn(".dialogue-text-container1", 1);

                if (i == dialogues.length - 2) {
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    this.uiManager.fadeOut(".dialogue", 1);

                    this.uiManager.show(".movement-hint", false);
                    this.uiManager.fadeIn(".movement-hint", 1);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    this.uiManager.hide(".dialogue");

                }
                if(i ===2){
                    // offset the container to the top
                    dialogueContainer.style.top = "12%";
                }

            }
        }



    }

    startTimer() {

    }
    stopTimer() {

    }

    reset() {

        this.uiManager.fadeOut(".score", 1);
        this.uiManager.fadeOut(".movement-hint", 1);
        this.uiManager.fadeOut(".boost", 1);
        this.uiManager.fadeOut(".pursuer-info", 1);

    }


}