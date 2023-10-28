import gsap from "gsap";

export default class UiManager {

    constructor() {
    }

    _getElements(selectorOrElements) {
        if (typeof selectorOrElements === 'string') {
            return document.querySelectorAll(selectorOrElements);
        } else if (selectorOrElements instanceof HTMLElement) {
            return [selectorOrElements];
        } else if (selectorOrElements instanceof NodeList || Array.isArray(selectorOrElements)) {
            return [...selectorOrElements];
        } else {
            console.error("L'entrée n'est pas un sélecteur, un HTMLElement, un NodeList ou un Array.");
            return [];
        }
    }

    // Cache un élément ou un groupe d'éléments
    hide(selectorOrElements) {
        gsap.set(this._getElements(selectorOrElements), { opacity: 0, display: 'none' });
    }

    // Montre un élément ou un groupe d'éléments
    show(selectorOrElements, toogleOpacity = false) {
        if (toogleOpacity) {
            gsap.set(this._getElements(selectorOrElements), { opacity: 1, display: 'block' });
        } else{
            gsap.set(this._getElements(selectorOrElements), { display: 'block' });
        }
    }

    // FadeIn pour un élément ou un groupe d'éléments
    fadeIn(selectorOrElements, duree = 1) {
        gsap.to(this._getElements(selectorOrElements), { autoAlpha: 1, duration: duree });
    }

    // FadeOut pour un élément ou un groupe d'éléments
    fadeOut(selectorOrElements, duree = 1) {
        gsap.to(this._getElements(selectorOrElements), { autoAlpha: 0, duration: duree });
    }

    // Translation pour un élément ou un groupe d'éléments
    translate(selectorOrElements, xStart = 0, yStart = 0, xEnd = 0, yEnd = 0, duree = 1) {
        gsap.fromTo(this._getElements(selectorOrElements),
            { x: xStart, y: yStart },
            { x: xEnd, y: yEnd, duration: duree }
        );
    }

    // Fait clignoter un élément ou un groupe d'éléments
    blink(selectorOrElements, duree = 0.5) {
        gsap.fromTo(this._getElements(selectorOrElements),
            { autoAlpha: 0 },
            { autoAlpha: 1, yoyo: true, repeat: -1, duration: duree }
        );
    }
}