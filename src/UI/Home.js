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
       
        this.homeClicked = new Event('homeClicked');
        window.addEventListener('resourcesReady', () => {
            this.uiManager.show('#root',true);
            
        });
   
        this.startElement.addEventListener('click', () => {
            window.dispatchEvent(this.homeClicked);
            this.uiManager.hide('#root');
            console.log("hided");

        });
        
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