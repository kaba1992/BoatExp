import '../UI/Home.css'
import EventEmitter from '../Experience/Utils/EventEmitter.js'
import Experience from '../Experience/Experience'

export default class Home extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.rootElement = document.querySelector("#root");
        this.startElement = document.querySelector('#start'); // Ciblage de l'élément dans le constructeur
    
        this.rootElement.style.opacity = 0;
        this.homeClicked = new Event('homeClicked');
        window.addEventListener('resourcesReady', () => {
           
            this.show();
            window.dispatchEvent(this.homeClicked);
            this.hide();

        });
        // this.addEvent(this.startElement, 'click', () => {
        //     window.dispatchEvent(this.homeClicked);
        //     this.hide();
        //     console.log("hided");
        // });
        this.startElement.addEventListener('click', () => {
        
            console.log("hided");

        });
        
    }

    show() {
        this.rootElement.style.opacity = 1;
        console.log(this.rootElement.style.opacity);
    }

    hide() {
        this.rootElement.style.opacity = 0;
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