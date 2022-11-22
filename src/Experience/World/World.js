import Experience from '../Experience.js'
import Environment from './Environment.js'
import SkyWater from './SkyWater.js'
import Boat from './Boat.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.skyWater = new SkyWater()
       
        this.resources.on('ready', () => {
            // Setup
            this.boat = new Boat()
            this.environment = new Environment()
        })
    }

    update() {
        if (this.boat) {
            this.boat.update()
        }

        this.skyWater.update()
    }
}