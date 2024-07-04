import Component from "../../../react/Component.js";
import Container from "../../components/containers/index.js";
import Popup from "../../components/popup/popup.js";
import authProvider from "../../provider/authProvider.js";
import tournamentProvider from "../../provider/tournamentProvider.js";
import userProvider from "../../provider/userProvider.js";
import LoginForm from "../Login/loginForm.js";


export default class StartTournament extends Component {
    constructor(to, re) {
        super(to);
        this.init();
        this.re = re;
        const urlParams = new URLSearchParams(window.location.search);
        this.code = urlParams.get("code");
    }
    init() {
        const [showLogin, setShowLogin] = this.useState(false);
        this.showLogin = showLogin;
        this.setShowLogin = setShowLogin;
        this.idx = 0;
    }
    render() {
        return Container({
            title: "",
            className: "container vertical-center grid-container",
            children: `
            <div id="error-message-tournament" class="text-danger"></div>
            ${tournamentProvider.get().tournament_player.map((player, idx) => {
                    let content = '';
                    if (idx === 0 || idx === 3 || idx === 5) {
                        content += '<div class="row">'
                    } if (idx === 4) { 
                        content += Container({
                            title: "",
                            className: "col-4 ",
                            children: `
                            <div class="grid-item">
                                <button class="btn btn-primary mt-3" id="start_tournament">Start Game</button>
                            </div>`
                        })
                    }
                    if (player.token !== null && player.token !== undefined) {
                        content += Container({
                            title: "",
                            className: `col-4`,
                            children: `
                            <div class="grid-item" style="width: 18rem;">
                                <img src="${player.user.profile_picture}" class="card-img-top" alt="foto">
                                <h5 class="card-title">${player.user.username}</h5>
                            </div>
                            `
                        })
                    } else {
                        content += Container({
                            title: "",
                            className: `col-4 `,
                            children: `
                                <div class="grid-item ${"logar_container"}" data-id=${idx}>
                                    <i class="fas fa-regular fa-plus"></i>
                                    <h5 class="card-title">Logar player 0${idx}</h5>
                                </div>
                            `
                        })
                    }
                    if (idx === 2 || idx === 4 || idx === 7) {
                        content += '</div>'
                    }
                    return content;
                }).join('')
            }`})
            +  `<div class="popup pop_up_login"> </div>`
    }

    async mount() {
        const {_, token} = authProvider.get()
        if (this.code) {
            this.idx = sessionStorage.getItem('idx');
            this.code = null;
            this.setShowLogin(true);
        }
        document.querySelector("#start_tournament").addEventListener('click', async function () {
            try {
                document.getElementById('start_tournament').disabled = true;                
                await tournamentProvider.startTournament(token)
                return this.re()
            }
            catch (err) {
                document.getElementById('start_tournament').disabled = false;
                document.getElementById('error-message-tournament').innerHTML = "Minimo de 3 jogadores para o torneio!";
            
            }
        }.bind(this))
        document.querySelectorAll('.logar_container').forEach((container) =>
            container.addEventListener('click', async (event) => {
                event.preventDefault();
                document.getElementById('error-message-tournament').innerHTML = "";
                const id = event.currentTarget.getAttribute('data-id');
                this.idx = id;
                sessionStorage.setItem('idx', id);
                this.setShowLogin(true);
         }))
     
        const popUp = new Popup('.pop_up_login', 'Logar', `<div id="login_form"> </div>` , this.showLogin(), this.setShowLogin);
        popUp.reRender();
        if (this.showLogin()) {
            const setNewUser = async (token) => {
            const {tournament_id} = tournamentProvider.get();
            try {
                await tournamentProvider.addPlayer(tournament_id, token, this.idx)
                sessionStorage.removeItem('idx');
                this.setShowLogin(false);
            } catch (err) {
                this.setShowLogin(false);
                document.getElementById('error-message-tournament').innerHTML = "Usuário já cadastrado!";
            }
        }
        const login = new LoginForm("#login_form", setNewUser) 
        login.reRender();
      }
    }

}