import Experience from '../Experience.js'
import Environment from './Environment.js'
import Boat from './GameElements/Boat.js'


export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources


        this.resources.on('ready', (e) => {

            // Setup
            this.boat = new Boat()
            // this.skyWater = new SkyWater()
            this.environment = new Environment()
        })
    }

    update() {
        if (this.boat) {
            this.boat.update()


        }

    }
    resize() {
        if (this.boat) {
            // this.boat.resize()
        }
    }
}