import Component from '../../../../react/Component.js';
import Ball from '../ball/index.js';
import Padlle from '../paddle/index.js';
import IA from '../IA/index.js';
import { newPowerUp } from '../powerUp/index.js';
import { randomBetween } from "../../../utils/random.js";
import gameProvider from '../../../provider/gameProvider.js';
import userProvider from '../../../provider/userProvider.js';

export const vr = {  
    BALL_RADIUS: 10,
    BALL_SPEED: 5,
    PADDLE_HEIGHT: 100,
    PADDLE_WIDTH: 8,
    PADDLE_SPEED: 4.5,
};

class Game extends Component {
    constructor(to) {
        super(to);
        this.startGame = false;
        this.side = gameProvider.playerSide;
        this.canvasRef = null;
        this.timeouts = [];
        this.ball = null;
        this.paddle1 = null;
        this.paddle2 = null;
        this.powerUpsRef = [];
        this.ia = null;
        this.animationFrameId = null;
    }

    async newRender(type, score, gameOver, apperance) {
        this.destroy();
        this.type = type;
        this.score = score;
        this.gameOver = gameOver;
        this.apperance = apperance;
        if (this.apperance === undefined || this) {
            this.apperance = userProvider.get().apperance;
        }
        return this.reRender()
    }

    async verifyScore(player) {
        this.destroy() 
        return this.score(player);
    }

    handleKeyDown(e) {
        e.preventDefault();
        if (this.paddle1) this.paddle1.handleKeyDown(e);
        if (this.paddle2) this.paddle2.handleKeyDown(e);
    }

    handleKeyUp(e) {
        e.preventDefault();
        if (this.paddle1) this.paddle1.handleKeyUp(e);
        if (this.paddle2) this.paddle2.handleKeyUp(e);
    }

    start(e) {
        e.preventDefault();
        if (e.key === 'Enter') this.startGame = true;
    }

    drawCenterLineAndCircle(ctx, canvasWidth, canvasHeight) {
        ctx.strokeStyle = this.apperance.ball_color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();
        ctx.closePath();
    }

    initCanvas() {
        
            this.canvasRef = document.querySelector('canvas');
            this.canvasRef.width = this.canvasRef.clientWidth;
            this.canvasRef.height = this.canvasRef.clientHeight;
    }

    initGameObjects() {
        this.ball = Ball(this.canvasRef, this.apperance.ball_color);
        this.type === "right" ?
            this.paddle1 = Padlle(this.canvasRef, 'iaUp', 'iaDown', 0, this.apperance.paddle_color) :
            this.paddle1 = Padlle(this.canvasRef, 'w', 's', 0, this.apperance.paddle_color);
        this.paddle2 = this.type === "left" ? 
            Padlle(this.canvasRef, 'iaUp', 'iaDown', this.canvasRef.width - vr.PADDLE_WIDTH,this.apperance.paddle_color) :
            Padlle(this.canvasRef, 'ArrowUp', 'ArrowDown', this.canvasRef.width - vr.PADDLE_WIDTH,this.apperance.paddle_color);
        this.ia = IA(this.canvasRef, this.ball, this.type === "left" ? this.paddle2 : this.paddle1, this.paddle1);
    }

    initEventListeners() {
        if (this.startGame && !this.gameOver()) {
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
        } else {
            window.addEventListener('keydown', this.start.bind(this));
        }
    }

    removeEventListeners() {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('keydown', this.start.bind(this));
    }

    renderObjects(ctx) {
      
        this.drawCenterLineAndCircle(ctx, this.canvasRef.width, this.canvasRef.height);
        this.paddle1.render(0, this.canvasRef.height - vr.PADDLE_HEIGHT);
        this.paddle2.render(this.canvasRef.width - vr.PADDLE_WIDTH, this.canvasRef.height - vr.PADDLE_HEIGHT);
        this.ball.render();
        if (this.startGame && !this.gameOver()) {
            const spawnPowerUp = () => {
                
                const powerup = newPowerUp(this.canvasRef);
                this.powerUpsRef.push(powerup);
                const timeoutId = setTimeout(spawnPowerUp, randomBetween(5000, 10000)); // Spawn a cada 5-10 segundos
                this.timeouts.push(timeoutId);
            };
            if (this.timeouts.length === 0) spawnPowerUp();
        }
    }

    renderFrame() {
        this.initEventListeners();
        const ctx = this.canvasRef.getContext('2d');
        ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        this.renderObjects(ctx);
        if (this.startGame && !this.gameOver()) {
            this.ball.move();
            this.powerUpsRef.forEach((powerUp, index) => {
                powerUp.render();
                if (powerUp.checkCollision(this.paddle1, this.ball, this.paddle2)) {
                    
                    this.powerUpsRef.splice(index, 1);
                }
                if (powerUp.move()) {
                    this.powerUpsRef.splice(index, 1);
                }
            });
            this.paddle1.movePaddle();
            this.paddle2.movePaddle();
            if (this.type !== "player2") {
                this.ia.move(this.powerUpsRef);
            }  
            if (this.ball.checkCollisions(this.paddle1, this.paddle2, this.verifyScore.bind(this)) == true) {
                return
            }
        } 
        this.animationFrameId = requestAnimationFrame(this.renderFrame.bind(this));
        
    }


    render() {
        return `
            <canvas class="canvas_container" style="border-color: ${this.apperance.ball_color};background: ${this.apperance.background_color};opacity:0.4; "></canvas>
        `;
    }

    async mount() {
        this.initCanvas()
        this.initGameObjects();
        if (this.animationFrameId === null) {
            this.renderFrame();
        }
    }

    destroy() {
        super.destroy();
        this.removeEventListeners()
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
        this.timeouts.forEach(clearTimeout);
        this.powerUpsRef = [];
        this.timeouts = [];
        this.startGame  = false;
    }

}

export default Game;
