import Experience from './Experience/Experience.js'
import { inject } from "@vercel/analytics"
const experience = new Experience(document.querySelector('canvas.webgl'))

// window.Physijs.scripts.worker = '../src/Experience/Utils/physijs_worker.js';

import './style.css'
import './UI/Home.css'
import Home from './UI/Home.html'
import HomeJs from './UI/Home.js'

inject()

const rootElement = document.querySelector("#root")
// on load
window.addEventListener('DOMContentLoaded', () => {

    rootElement.insertAdjacentHTML("afterbegin", Home);
  
    const home = new HomeJs();
});