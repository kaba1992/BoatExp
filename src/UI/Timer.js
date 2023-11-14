import gsap from 'gsap';

export default class Timer {
    constructor(secondsAllowed, container, startCallback, endCallback) {
        this.secondsAllowed = secondsAllowed * 1000;
        this.timer = { lapsed: this.secondsAllowed };
        this.container = container;
        this.container.classList.add('cd-tc');
        this.time = this.createTimeContainer();
        this.timerDisplay = this.createTimerDisplay();
        this.addElements();
        this.startCallback = startCallback;
        this.endCallback = endCallback;
        this.init();
    }

    addElements() {
        this.container.appendChild(this.timerDisplay)
        this.timerDisplay.appendChild(this.time)

    }

    createTimeContainer() {
        const div = document.createElement('h1')
        div.className = 'time'
        return div;
    }

    createTimerDisplay() {
        const div = document.createElement('div')
        div.className = 'timer-display'
        return div;
    }




    setTimeDisplay() {
        let minutes = Math.floor(this.timer.lapsed / 60000),
            seconds = Math.floor((this.timer.lapsed % 60000) / 1000),
            milliseconds = this.timer.lapsed % 1000;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        if (milliseconds < 100) {
            milliseconds = `0${milliseconds}`;
        }
        this.time.textContent = `${minutes}:${seconds}:${milliseconds.toString().substr(0, 2)}`;

    }


    init() {
        this.setTimeDisplay();
        this.setListeners();
    }

    startTimer() {
        //   this.startCallback();
        this.decrementTimer();

    }

    endTimer() {
        // this.timesUp.style.display = 'block'
        // this.resetBtn.style.display = 'inline-block'
        // this.endCallback()
    }

    resetTimer() {

        this.timerDisplay.style.display = 'block'
        this.timesUp.style.display = 'none'
        this.timer.lapsed = this.secondsAllowed;
        this.setTimeDisplay();
    }

    decrementTimer() {
        gsap.to(this.timer, {
            duration: 0.01, lapsed: this.timer.lapsed - 15, onComplete: () => {
                this.setTimeDisplay();
                if (this.timer.lapsed > 0) {
                    this.decrementTimer();
                } else {
                    this.endTimer();
                }
            }
        })
    }

    incrementTimer(milliseconds) {
        gsap.to(this.timer, {
            duration: 0.01, lapsed: this.timer.lapsed + milliseconds, onComplete: () => {
                this.setTimeDisplay();
                if (this.timer.lapsed > 0) {
                    this.decrementTimer();
                } else {
                    this.endTimer();
                }
            }
        })
    }

   

    setListeners() {
        let that = this;

    }
}

const myStartCallback = () => {
    console.log('ran start callback')
}

const myEndCallback = () => {
    console.log('ran end callback')
}

//   const timer = new Timer(90, document.querySelector('.timer-container'), myStartCallback, myEndCallback)
