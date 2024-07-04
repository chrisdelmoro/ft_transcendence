import Component from "../../../react/Component.js"
import authProvider from "../../provider/authProvider.js"
import userProvider from "../../provider/userProvider.js"
import Footer from "../footer/index.js"
import ThemeSelector from "../themeSelector/index.js"

class MainPage extends Component{
    constructor(to, apperance){
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
    }

    init(){

    }

    render(){
        return `
            <h1 class="mt-5">Pong</h1>
            <div class="game-modes d-flex flex-column align-items-center mt-5">
                <button class="btn btn-lg modo-solo">Modo Solo</button>
                <button class="btn btn-lg mt-3 pvp">Modo Desafio</button>
                <button class="btn btn-lg mt-3 pvt">Modo Torneio</button>
            </div>
            <p class="mt-3">Escolha um dos temas abaixo:</p>
            <div class="themes d-flex justify-content-center mt-3"> </div>
            ${Footer()}
        `
    }

    
    
    
    mount(){
        document.querySelector('.pvp').addEventListener('click', () => navigateTo('/pvp'))
        document.querySelector('.pvt').addEventListener('click', () => navigateTo('/tournament'))
        document.querySelector(".modo-solo").addEventListener("click", () => navigateTo("/vsai"))
        const changeTheme = (new_apperance) =>{
            const {token} = authProvider.get()
            userProvider.setNewApperence(token, new_apperance)
            this.setCustomizeSchema({
                theme: new_apperance.theme,
                paddleColor: new_apperance.paddleColor,
                ballColor: new_apperance.ballColor,
                backgroundColor: new_apperance.backgroundColor
            })
        }
        const themes =  new ThemeSelector('.themes', changeTheme, this.customizeSchema().theme, this.customizeSchema())
        themes.reRender()
    }

}


export default MainPage