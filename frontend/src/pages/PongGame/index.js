import Component from "../../../react/Component.js";
import SoundControl from "../../components/soundControl/index.js";
import authProvider from "../../provider/authProvider.js";
import gameProvider from "../../provider/gameProvider.js";
import userProvider from "../../provider/userProvider.js";
    import Game from './game/index.js';

    class PageGame extends Component {
        constructor(to) {
            super(to);
            this.init();
            this.frame = 0;
        }
        
        init() {
            const [scoreP1, setScoreP1] = this.useState(0);
            const [scoreP2, setScoreP2] = this.useState(0);
            const [gameOver, setGameOver] = this.useState(false);
            this.scoreP1 = scoreP1;
            this.scoreP2 = scoreP2;
            this.gameOver = gameOver;
            this.setScoreP1 = setScoreP1;
            this.setScoreP2 = setScoreP2;
            this.setGameOver = setGameOver;
           
            this.soundControl = new SoundControl('#sound-control-container', 'assets/sounds/music.m4a');
            this.game = undefined;
        }
        
        GameOver() {
            const { game, player1, player2} = gameProvider.get();
            const {user} = userProvider.get();
            if (game.type === "ai") {
                return `
                <h1>Game Over</h1>
                ${game.score_player1 ? `<h1>${user.username} Win</h1>` : `<h1>AI Win</h1>`}
                <button type="button" class="btn btn-dark btn-block" style="margin-top: 10px;">Voltar</button>
                `;
            }
            return `
            <h1>Game Over</h1>
            ${this.scoreP1() === 5 ? `<h1>${player1.username} Win</h1>` : `<h1>${player2.username} Win</h1>`}
            <button type="button" class="btn btn-dark btn-block" style="margin-top: 10px;">
            ${game.type == 'tournament' ? "Continuar Torneio" : "Voltar" }</button>
            `;
        }
        
        renderGame() {
            return `<div id="game-container" class="ping-pong-container"></div>`;
        }
        
        render() {
            const { player1, player2, game, side} = gameProvider.get();
            if (game.type === "ai") { 
                const {user} = userProvider.get();
                return  `
                <div id="sound-control-container"></div>
                    <div class="container-pageGame">
                    ${side === "left" ? `
                        <h1>${user.username} VS AI</h1>
                        `: `
                        <h1>AI VS ${user.username}</h1>   
                        `}
                    <h1>${this.scoreP1()} - ${this.scoreP2()}</h1>
                    ${this.gameOver() ? this.GameOver() : this.renderGame()}
                </div>
                `
            }
            return `
            <div id="sound-control-container"></div>
            <div class="container-pageGame">
                <h1>${player1.username} VS ${player2.username}</h1>
                <h1>${this.scoreP1()} - ${this.scoreP2()}</h1>
                ${this.gameOver() ? this.GameOver() : this.renderGame()}
            </div>
            `;
        }
        

        mount() {
            this.frame = 0;
            const {game, player1} = gameProvider.get();
            const {token} = authProvider.get();
            if (game === undefined) { 
                return navigateTo('/home')
            } 
            this.setScoreP1(game.score_player1)
            this.setScoreP2(game.score_player2)
            this.setGameOver(game.status === "active" ? false : true)
            this.soundControl.reRender();
            const score = (player) => {
                game.score_player1 = player === "player1" ? game.score_player1 + 1 : game.score_player1;
                game.score_player2 = player === "player2" ? game.score_player2 + 1 : game.score_player2;
                if (game.score_player1 === 5 || game.score_player2 === 5) {
                    game.end = true;
                    game.winner = game.score_player1 === 5 ? game.player1_id : game.player2_id;
                    if (game.type === "ai") {
                        game.status = "ended";
                    }
                }
                if (game.type !== "ai") {
                    try {
                        gameProvider.setScore(token, player);
                    }catch (err) {
                        console.error(err);
                    }
                }
                return this.reRender();
            };
            if (!this.gameOver()) {
                const {side} = gameProvider.get();
                const {user} = userProvider.get();
                let apperance = game.type === "ai" ? user.appearance[0] : player1.appearance[0];
                if (apperance === undefined ){
                    apperance = user.appearance[0];
                }
                if (this.game === undefined) {
                    this.game = new Game('#game-container');
                }
                this.game.newRender(game.type === "ai" ?  side : "player2" , score, this.gameOver, apperance);
            } else {
                document.querySelector('.btn').addEventListener('click', () => { 
                    gameProvider.reset()
                    game.type == 'tournament' ? navigateTo('/tournament') : navigateTo('/home');
                });
            }
        }
    }

export default PageGame;
