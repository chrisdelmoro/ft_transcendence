import Component from "../../../react/Component.js"
import authProvider from "../../provider/authProvider.js"
import userProvider from "../../provider/userProvider.js"
import ThemeSelector from "../themeSelector/index.js"

class MainVsAI extends Component{
    constructor(to, apperance, isplayer){
        super(to)
        this.init()
        const [customizeSchema, setCustomizeSchema] = this.useState({
            theme: apperance.theme,
            paddleColor: apperance.paddle_color,
            ballColor: apperance.ball_color,
            backgroundColor: apperance.background_color
        }); 
        this.customizeSchema = customizeSchema;
        this.setCustomizeSchema = setCustomizeSchema;
        this.isplayer = isplayer;
        const {user} = userProvider.get();
        this.user = user;
    }

    init(){

    }

    render(){
        const infoIconId = this.isplayer ? "info-icon-player" : "info-icon-ai";
        return `
                 ${this.isplayer ? ` 
                                    <div class="info-div">
                                        <i id="${infoIconId}" class="fa fa-solid fa-info"></i>
                                    </div>
                                    <img src="${this.user.profile_picture}" alt="Player Icon" class="player-picture">
                                    <p>${this.user.username}<br>
                                        (Você)</p>
                    
                                    ` :
                                    `
                                    <div class="custom-icon-info">
                                        <i id="${infoIconId}" class="fa fa-solid fa-brain""></i>
                                    </div>
                                    <p>IA</p>
                                `}
        `
    }

    
    
    
    mount(){
        const infoIconId = this.isplayer ? "#info-icon-player" : "#info-icon-ai";
        document.querySelector(infoIconId).addEventListener("click", () => {
            this.showInstructions();
        });
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'instructions-card';
        instructions.innerHTML = `
            <div class="instructions-overlay">
                <div class="instructions-content">
                    <span id="close-instructions" class="close">&times;</span>
                    <h2>Instruções</h2>
                    <p>Para jogar, use as teclas:</p>
                    <div class="intruc">
                        <div>
                            <p>Lado Esquerdo</p>
                            <p>W - Subir</p>
                            <p>S - Descer</p>
                        </div>
                        <div>
                            <p>Lado Direito</p>
                            <p><i class="fa fa-solid fa-arrow-up"></i> - Subir</p>
                            <p><i class="fa fa-solid fa-arrow-down"></i> - Descer</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(instructions);

        document.querySelector("#close-instructions").addEventListener("click", () => {
            document.body.removeChild(instructions);
        });
        document.querySelector(".instructions-overlay").addEventListener("click", () => {
            document.body.removeChild(instructions);
        });
    }

}


export default MainVsAI