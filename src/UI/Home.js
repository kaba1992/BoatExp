import '../UI/Home.css'
import EventEmitter from '../Experience/Utils/EventEmitter.js'
import Experience from '../Experience/Experience'
import UiManager from './UiManager';

export default class Home extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.startElement = document.querySelector('#start');
        //Ciblage de l'élément dans le constructeur
        this.uiManager = new UiManager();
        this.uiManager.hide('#root');

        this.dialogues = [
            "Hello young Rookie, welcome to 'Sea Of Sharks'. I am Captain Flyn, and I need your help!",
            "My cargo was lost at sea and half of my crew was eaten by sharks",
            "Your job is to bring me back my supplies as fast as possible. But I have to warn you ehe, I did hire more mercenaries, only the fastest one will be paid.",
            "Be carefull, the sharks are still roaming around us. Good luck rookies and may the best win !",
        ]

        this.homeClicked = new Event('homeClicked');
        const text1 = document.querySelector('.dialogue-text-container1');

        this.uiManager.hide(".dialogue-text-container1");
        this.uiManager.hide(".dialogue-text-container2");

        // text1.innerHTML = this.dialogues[2];

        window.addEventListener('resourcesReady', () => {
            this.uiManager.show('#root', true);
            this.setDilogues(text1);

        });

        this.startElement.addEventListener('click', () => {
            window.dispatchEvent(this.homeClicked);
            this.uiManager.hide('#root');
            console.log("hided");

        });


    }


    setDilogues(text1) {
        this.uiManager.show(".dialogue-text-container1", false);
        text1.innerHTML = this.dialogues[0];
        this.uiManager.fadeIn(".dialogue-text-container1", 1);
        setTimeout(() => {
            for (let i = 0; i < this.dialogues.length; i++) {
                if (i % 2 == 0) {
                    setTimeout(() => {
                        this.uiManager.fadeOut(".dialogue-text-container1", 1);
                        setTimeout(() => {
                            text1.innerHTML = this.dialogues[i + 1];
                            this.uiManager.fadeIn(".dialogue-text-container1", 1);
                        }, 1000);

                    }, 4000 * i);
                }
                if (i == this.dialogues.length - 1) {
                    console.log("last");
                }

            }
        }, 4000);

    }




    addEvent(element, event, callback) {

        if (element) {
            element.addEventListener(event, callback);
        } else {
            console.error("L'élément n'existe pas ou n'a pas été trouvé.");
        }
    }

    update() {

    }


}










// const rootElement =  document.querySelector("#root")

// const eventEmitter = new EventEmitter()
// console.log(eventEmitter);
// eventEmitter.on('ready', () =>{
//     console.log('HomeIsreadysdefddddddddddddddddddddddddd')
//     // pass opacity to 0
// })
// rootElement.style.opacity = 0