import Component from "../../../react/Component.js";
import Container from "../../components/containers/index.js";
import Footer from "../../components/footer/index.js";
import Popup from "../../components/popup/popup.js";
import TopBar from "../../components/topBar/topBar.js";
import authProvider from "../../provider/authProvider.js";
import gameProvider from "../../provider/gameProvider.js";
import userProvider from "../../provider/userProvider.js";
import LoginForm from "../Login/loginForm.js";


export default class PvPage extends Component {
    constructor(to) {
        super(to);
        this.init();
        const urlParams = new URLSearchParams(window.location.search);
        this.code = urlParams.get("code");
    }
    init() {
        const [showLogin, setShowLogin] = this.useState(false);
        this.showLogin = showLogin;
        this.setShowLogin = setShowLogin;
        this.player = undefined;
    }

    render () {
        const {user} = userProvider.get();
        return `
        <nav id="top_bar" class="navbar navbar-expand navbar-custom"> </nav>
        <div class="page">
        ${Container({
            title: "Duelo",
            className: "container vertical-center grid-container",
            children : `
            <div id="error-message-tournament" class="text-danger"></div>
            <div class="row" style="width:80%">
                ${Container({
                    title: "",
                    className: `col pvp-item`,
                    children: `
                    <div class="grid-item">
                        <img src="${user.profile_picture}" class="card-img-top" alt="foto">
                        <h5 class="card-title">${user.username}</h5>
                    </div>
                    `
                })}
                <div class="col" style="text-align: center; margin: auto;">
                    <h1>VS</h1>
                </div>
                ${Container({
                    title: "",
                    className: `col`,
                    children: this.player === undefined ? `
                        <div class="grid-item ${"logar_container"}" >
                            <i class="fas fa-regular fa-plus"></i>
                            <h5 class="card-title">Logar player </h5>
                        </div>
                    ` : `<div class="grid-item">
                        <img src="${this.player.profile_picture}" class="card-img-top" alt="foto">
                        <h5 class="card-title">${this.player.username}</h5>
                    </div> `
                })}
            </div>
            <div class="row">
                <button id="start-game" class="btn btn-primary btn-block" style="background-color: #00e5ff; border: none; margin-top:20px;">Start Game</button>
            </div>
            `
        })}
        </div>
        <div class="pop_up_login"></div>
        ${Footer()}
        `
    }
    async mount () {
        const {_, token} = authProvider.get()
        if (this.code) {
            this.code = null;
            this.setShowLogin(true);
        }
        const topBar = new TopBar('#top_bar', false);
        topBar.reRender();
        document.querySelector("#start-game").addEventListener('click', async (event) => {
            event.preventDefault();
            if (this.player === undefined) {
                return document.getElementById('error-message-tournament').innerHTML = "Minimo de 2 jogadores para o torneio!";
            }   
            try {
                document.querySelector("#start-game").disabled = true;
                await gameProvider.createGame(token, userProvider.get().user, this.player)
                return navigateTo('/game')
            }
            catch (err) {
                document.querySelector("#start-game").disabled = false;
                document.getElementById('error-message-tournament').innerHTML = "Erro tente novamente mais tarde!";
            
            }
        })
        document.querySelectorAll('.logar_container').forEach((container) =>
            container.addEventListener('click', async (event) => {
                event.preventDefault();
                document.getElementById('error-message-tournament').innerHTML = "";
                this.setShowLogin(true);
         }))
     
        const popUp = new Popup('.pop_up_login', 'Logar', `<div id="login_form"> </div>` , this.showLogin(), this.setShowLogin);
        popUp.reRender();
        if (this.showLogin()) {
            const setNewUser = async (token) => {
            try {
                this.player = await userProvider.getUser(token, false);
                this.setShowLogin(false);
            } catch (err) {
                this.setShowLogin(false);
            }
        }
        const login = new LoginForm("#login_form", setNewUser, true) 
        login.reRender();
      }
    }
}
