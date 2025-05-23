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
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        if (milliseconds < 100) {
            milliseconds = `0${milliseconds}`;
        }
        this.time.innerHTML = `${minutes}:${seconds}:${milliseconds.toString().substr(0, 2)}`;

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
       const event = new Event('gameOver');
         window.dispatchEvent(event);
         this.resetTimer();
    }

    resetTimer() {

        this.timerDisplay.style.display = 'block'
        // this.timesUp.style.display = 'none'
        this.timer.lapsed = this.secondsAllowed;
        this.setTimeDisplay();
    }

    decrementTimer() {
        gsap.to(this.timer, {
            duration: 0.01, lapsed: this.timer.lapsed - 15, onComplete: () => {
                this.setTimeDisplay();
                if (this.timer.lapsed > 0) {
                    this.decrementTimer();
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
                }
              
            }
        })
    }

    stopDecrementation() {
        gsap.killTweensOf(this.timer);
    }
   

    setListeners() {
        let that = this;

    }

    update(){
        if (this.timer.lapsed <= 0) {
            this.endTimer();
        }
        
    }
}




//   const timer = new Timer(90, document.querySelector('.timer-container'), myStartCallback, myEndCallback)
