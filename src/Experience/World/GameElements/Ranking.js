import Experience from "../../Experience";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { doc, setDoc, getDocs } from "firebase/firestore";

export default class Ranking {
    constructor() {
        this.experience = new Experience();
        this.uiManager = this.experience.uiManager;
        this.timer = this.experience.timer;
        this.firebaseApp = null;
        this.analytics = null;
        this.auth = null;
        this.db = null;
        this.isUserNameStored = false;
        this.uiManager.hide('.getUserName');
        this.username = this.getUsernameFromLocalStorage();
        this.usernameInput = document.querySelector('.getUserName-text-input');
        this.rankings = new Map();
        this.top5 = new Map();
        this.initializeFirebase();
        this.getUserBestScore();
        // this.getCurrentUserLastScore();
        this.bestScore = 0;
        this.getRankingAndTop5();
        this.getCurrentUserLastScore();
        this.setListeners();


    }

    setListeners() {
      
        const submitUsernameButton = document.querySelector('.getUserName-text-button');
        const setUserNameEvent = new Event('setUserName');
        submitUsernameButton.addEventListener('click', () => {
            if (this.usernameInput.value) {
                // lower case the username
                this.setUser(this.usernameInput.value.toLowerCase());
                this.storeUserScore(this.usernameInput.value, window.score);
                this.uiManager.fadeOut('.getUserName', 1);
                window.dispatchEvent(setUserNameEvent);
                setTimeout(() => {
                    this.uiManager.hide('.getUserName');
                }, 1000);
            } else {
                console.log("Pas de username défini");
            }
        });


        window.addEventListener('gameOver', () => {
            if (!this.isUserNameStored) {
                this.uiManager.show('.getUserName', false, 'flex');
                this.uiManager.fadeIn('.getUserName', 1);
                this.timer.stopDecrementation();
            } else {
                this.updateScore(window.score);
                this.getRankingAndTop5();
                this.getCurrentUserLastScore();
                this.getUserBestScore();
            }

        });

        window.addEventListener('reset', () => {
            this.reset();
        });
    }

    initializeFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyBTPn_0p8evq-5bns9AzszbXm6HvOXDkzs",
            authDomain: "seaofsharks-32403.firebaseapp.com",
            projectId: "seaofsharks-32403",
            storageBucket: "seaofsharks-32403.appspot.com",
            messagingSenderId: "92150367544",
            appId: "1:92150367544:web:3827e9c84acea989986dcd",
            measurementId: "G-CTXGV8FKHW"
        };

        // Initialize Firebase
        this.firebaseApp = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(this.firebaseApp);
        this.auth = getAuth(this.firebaseApp);
        this.db = getFirestore(this.firebaseApp);


    }

    getUsernameFromLocalStorage() {
        const username = localStorage.getItem('username');
        if (username) {
            this.isUserNameStored = true;
            return username;

        } else {
            console.log("Pas de username enregistré dans le localStorage");
            this.isUserNameStored = false;
            return null;
        }
    }

    async storeUserScore(username, score) {
        try {

            localStorage.setItem('bestScore', this.bestScore);
            const userScoreRef = doc(this.db, "userScores", username);
            const userBestScoreRef = doc(this.db, "userBestScores", username);
            await setDoc(userScoreRef, { score: score });
            if (this.bestScore) {
                await setDoc(userBestScoreRef, { score: this.bestScore });
            }
            this.isUserNameStored = true;
            console.log("Score enregistré avec succès !");

        } catch (e) {
            console.error("Erreur lors de l'enregistrement du score : ", e);
        }

    }

    setUser(username) {
        this.username = username;
        localStorage.setItem('username', username);
    }


    async updateScore(newScore) {
        if (this.username && newScore !== undefined) {
            try {
                if (newScore > this.bestScore) {
                    this.bestScore = newScore;
                }

                if (this.bestScore !== undefined) {
                    const userScoreRef = doc(this.db, "userScores", this.username);
                    await setDoc(userScoreRef, { score: this.bestScore });

                    const userBestScoreRef = doc(this.db, "userBestScores", this.username);
                    await setDoc(userBestScoreRef, { bestScore: this.bestScore });
                    console.log("Score enregistré avec succès !");
                } else {
                    console.log("Le meilleure score est undefined, mise à jour annulée.");
                }
            } catch (e) {
                console.error("Erreur lors de la mise a jour du score : ", e);
            }
        } else {
            console.log("Pas de username défini");
        }
    }

    async getCurrentUserLastScore() {
        if (this.username) {
            const userScoreRef = doc(this.db, "userScores", this.username);
            const docSnap = await getDocs(collection(this.db, "userScores"));
            docSnap.forEach((doc) => {
                doc.id === this.username ? this.bestScore = doc.data().score : null;
            });


        } else {
            console.log("Pas de username défini");
        }
    }


    async getRanking() {
        const userScoresRef = collection(this.db, "userScores");
        const querySnapshot = await getDocs(collection(this.db, "userScores"));
        querySnapshot.forEach((doc) => {
            this.rankings.set(doc.id, doc.data().score);
        });
        this.rankings = new Map([...this.rankings.entries()].sort((a, b) => b[1] - a[1]));
        this.top5 = new Map([...this.rankings].slice(0, 5));
    }
    async getUserBestScore() {
        const userBestScoresRef = collection(this.db, "userBestScores");
        const querySnapshot = await getDocs(collection(this.db, "userBestScores"));
        querySnapshot.forEach((doc) => {
            this.bestScore = doc.data().bestScore;
        });

    }



    displayTop5() {

        const top5ListElement = document.getElementById('ranking');
        top5ListElement.innerHTML = '';
        if (!top5ListElement) return;

        this.top5.forEach((bestScore, username) => {

            const listParent = document.createElement('div');
            listParent.className = 'listParent';
            top5ListElement.appendChild(listParent);
            const listItemUsername = document.createElement('li');
            listItemUsername.className = 'listItemUsername';
            // uppercase the first letter of the username
            listItemUsername.textContent = username.charAt(0).toUpperCase() + username.slice(1);
            const listItemScore = document.createElement('li');
            listItemScore.className = 'listItemScore';
            listItemScore.textContent = bestScore;
            listParent.appendChild(listItemUsername);
            listParent.appendChild(listItemScore);
        });
    }

    async getRankingAndTop5() {
        await this.getRanking();
        this.displayTop5();
    }

    reset() {
  
    }

    update() {


    }
}