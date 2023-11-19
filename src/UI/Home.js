import '../UI/Home.css'
import EventEmitter from '../Experience/Utils/EventEmitter.js'
import Experience from '../Experience/Experience'



const dialogues = [
    "Hello young Rookie, welcome to 'Sea Of Sharks'. I am Captain Flyn, and I need your help!",
    "My cargo was lost at sea and half of my crew was eaten by sharks",
    "Your job is to bring me back my supplies as fast as possible. But I have to warn you ehe, I did hire more mercenaries, only the fastest one will be paid.",
    "Be carefull, the sharks are still roaming around us. Good luck rookies and may the best win !",
];

export default class Home extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.uiManager = this.experience.uiManager;
        this.timer = this.experience.timer;

        this.homeClicked = new Event('homeClicked');

        this.uiManager.hide('#root');
        this.uiManager.hide(".dialogue-text-container1");
        this.uiManager.hide(".dialogue-text-container2");
        this.uiManager.hide(".dialogue");
        this.uiManager.hide(".gameOverContainer");
        this.uiManager.hide(".movement-hint");
        this.uiManager.hide(".score");
        this.uiManager.hide(".timer ");


        const text1 = document.querySelector('.dialogue-text-container1');
        this.setListeners(text1);
    }



    setListeners(text1) {
        const readyButton = document.querySelector('.movement-hint-ready');
        const resetButton = document.querySelector('.gameOver-restart');
        const readyEvent = new Event('ready');
        const resetEvent = new Event('reset');


        window.addEventListener('resourcesReady', () => {
            window.dispatchEvent(this.homeClicked);
            this.uiManager.show('#root', true);
            this.setDilogues(text1);
        });

        readyButton.addEventListener('click', () => {
            this.uiManager.fadeOut(".movement-hint", 1);
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
            this.uiManager.show(".gameOverContainer", false);
            this.uiManager.fadeIn(".gameOverContainer", 1);
            this.reset();
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
    }

    async setDilogues(text1) {
        window.addEventListener('revealEnd', async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // this.uiManager.show(".dialogue", false);
            // this.uiManager.fadeIn(".dialogue", 1);
            this.uiManager.show(".movement-hint", false);
            this.uiManager.fadeIn(".movement-hint", 1);
            await new Promise(resolve => setTimeout(resolve, 4000));

            // for (let i = 0; i < dialogues.length; i++) {
            //     await new Promise(resolve => setTimeout(resolve, 4000 * i));
            //     this.uiManager.fadeOut(".dialogue-text-container1", 1);
            //     await new Promise(resolve => setTimeout(resolve, 1000));
            //     text1.innerHTML = dialogues[i + 1];
            //     this.uiManager.fadeIn(".dialogue-text-container1", 1);
            //     if (i == dialogues.length - 2) {
            //         await new Promise(resolve => setTimeout(resolve, 4000));
            //         this.uiManager.fadeOut(".dialogue", 1);
            //         this.uiManager.show(".movement-hint", false);
            //         this.uiManager.fadeIn(".movemenzt-hint", 1);

            //     }
            //     console.log(i);
            // }
        });

        this.uiManager.show(".dialogue-text-container1", false);
        text1.innerHTML = dialogues[0];
        this.uiManager.fadeIn(".dialogue-text-container1", 1);
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