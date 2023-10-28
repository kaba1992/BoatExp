import Experience from './Experience/Experience.js'
const experience = new Experience(document.querySelector('canvas.webgl'))

import './style.css'
import './UI/Home.css'
import Home from './UI/Home.html'
import HomeJs from './UI/Home.js'


const rootElement = document.querySelector("#root")
// on load
window.addEventListener('DOMContentLoaded', () => {
    rootElement.insertAdjacentHTML("afterbegin", Home);
    console.log(document.querySelector('#start'));  // Ceci devrait afficher l'élément avec l'ID "start"
    const home = new HomeJs();
});