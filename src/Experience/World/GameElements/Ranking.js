import Experience from "../../Experience";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { doc, setDoc, getDocs, getDoc } from "firebase/firestore";

export default class Ranking {
    constructor() {
        this.experience = new Experience();
        this.uiManager = this.experience.uiManager;
        this.timer = this.experience.timer;
        this.firebaseApp = null;
        this.analytics = null;
        this.auth = null;
        this.db = null;
        this.isGameOver = false;
        this.isUserNameStored = false;
        this.uiManager.hide('.getUserName');
        this.username = this.getUsernameFromLocalStorage();
        this.usernameInput = document.querySelector('.getUserName-text-input');
        this.rankings = new Map();
        this.top5 = new Map();
        this.bestScore = 0;
        this.currentScore = 0;
        this.initializeFirebase();
        this.getUserBestScore();
        this.getRankingAndTop5();
        this.setListeners();
    }

    setListeners() {
        const submitUsernameButton = document.querySelector('.getUserName-text-button');
        const setUserNameEvent = new Event('setUserName');
        submitUsernameButton.addEventListener('click', () => {
            if (this.usernameInput.value) {
            
                const username = this.usernameInput.value.toLowerCase();
                this.setUser(username);
                this.storeUserScore(username, window.score);
                this.uiManager.fadeOut('.getUserName', 1);
                window.dispatchEvent(setUserNameEvent);
                setTimeout(() => {
                    this.uiManager.hide('.getUserName');
                }, 1000);
            } else {
                this.usernameInput.placeholder = 'Veuillez entrer un pseudo';
            }
        });

        window.addEventListener('gameOver', () => {
            if (!this.isUserNameStored) {
                this.uiManager.show('.getUserName', false, 'flex');
                this.uiManager.fadeIn('.getUserName', 1);
                this.timer.stopDecrementation();
            } else {
                if(!this.isGameOver && window.score) {
                    this.currentScore = window.score;
                    this.updateScore(this.currentScore);
                    this.isGameOver = true;
                }
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
            // Récupérer le meilleur score existant s'il y en a un
            const userBestScoreRef = doc(this.db, "userBestScores", username);
            const docSnap = await getDoc(userBestScoreRef);
            
            let bestScore = 0;
            if (docSnap.exists()) {
                bestScore = docSnap.data().score || 0;
            }
            
            // Mettre à jour le meilleur score si le score actuel est plus élevé
            if (score > bestScore) {
                bestScore = score;
            }
            
            this.bestScore = bestScore;
            localStorage.setItem('bestScore', bestScore);
            
            // Enregistrer le score actuel
            const userScoreRef = doc(this.db, "userScores", username);
            await setDoc(userScoreRef, { score: score });
            
            // Mettre à jour le meilleur score
            await setDoc(userBestScoreRef, { score: bestScore });
            
            this.isUserNameStored = true;
            console.log("Score enregistré avec succès !");
            
            // Mettre à jour le classement
            this.getRankingAndTop5();
            
        } catch (e) {
            console.error("Erreur lors de l'enregistrement du score : ", e);
        }
    }

    setUser(username) {
        this.username = username;
        localStorage.setItem('username', username);
    }

    async updateScore(newScore) {
        if (this.username) {
            try {
                // Obtenir le meilleur score actuel de l'utilisateur
                await this.getUserBestScore();
                
                // Mettre à jour le meilleur score si nécessaire
                if (newScore > this.bestScore) {
                    this.bestScore = newScore;
                    localStorage.setItem('bestScore', this.bestScore);
                }
                
                const username = this.username;
                const userScoreRef = doc(this.db, "userScores", username);
                const userBestScoreRef = doc(this.db, "userBestScores", username);
             
                await setDoc(userScoreRef, { score: newScore });
               
                await setDoc(userBestScoreRef, { score: this.bestScore });
                
                console.log("Score mis à jour avec succès !");
            
                await this.getRankingAndTop5();
                
            } catch (e) {
                console.error("Erreur lors de la mise à jour du score : ", e);
            }
        } else {
            console.log("Pas de username défini");
        }
    }

    async getUserBestScore() {
        if (this.username) {
            try {
                const userBestScoreRef = doc(this.db, "userBestScores", this.username);
                const docSnap = await getDoc(userBestScoreRef);
                
                if (docSnap.exists()) {
                    this.bestScore = docSnap.data().score || 0;
                } else {
                    this.bestScore = 0;
                }
                
                console.log(`Meilleur score pour ${this.username}: ${this.bestScore}`);
                
            } catch (e) {
                console.error("Erreur lors de la récupération du meilleur score : ", e);
                this.bestScore = 0;
            }
        } else {
            console.log("Pas de username défini");
            this.bestScore = 0;
        }
    }

    async getRanking() {
        try {
            this.rankings.clear();
            const querySnapshot = await getDocs(collection(this.db, "userBestScores"));
            
            querySnapshot.forEach((doc) => {
                this.rankings.set(doc.id, doc.data().score || 0);
            });
            
            // Trier par score décroissant
            this.rankings = new Map([...this.rankings.entries()].sort((a, b) => b[1] - a[1]));
            this.top5 = new Map([...this.rankings].slice(0, 5));
            
        } catch (e) {
            console.error("Erreur lors de la récupération du classement : ", e);
        }
    }

    displayTop5() {
        const top5ListElement = document.getElementById('ranking');
        if (!top5ListElement) return;
        
        top5ListElement.innerHTML = '';

        this.top5.forEach((bestScore, username) => {
            const listParent = document.createElement('div');
            listParent.className = 'listParent';
            
            // Mettre en évidence le joueur actuel
            if (username === this.username) {
                listParent.classList.add('currentPlayer');
            }
            
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
        this.isGameOver = false;
    }

    update() {
        // Cette méthode peut être utilisée pour des mises à jour régulières si nécessaire
    }
}