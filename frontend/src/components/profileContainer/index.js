import Component from "../../../react/Component.js";
import authProvider from "../../provider/authProvider.js";
import userProvider from "../../provider/userProvider.js";
import { validatePassword, validateUsername } from "../../utils/Validation.js";
import Container from "../containers/index.js";
import gameProvider from "../../provider/gameProvider.js";
import Popup from "../popup/popup.js";
import {formatDate} from "../../utils/formatTime.js";


export default class ProfileContainer extends Component {
    constructor(to, isEditabled = true, re) {
        super(to);
        this.re = re;
        const [showEdit, setShowEdit] = this.useState(false);
        const [show2FA, setShow2FA] = this.useState(false);
        const [showImageEdit, setShowImageEdit] = this.useState(false);
        const [showHistory, setShowHistory] = this.useState(false);
        this.showImageEdit = showImageEdit;
        this.setShowImageEdit = setShowImageEdit;
        this.user = userProvider.get().user;
        this.stats = this.user.stats[0];
        this.showHistory = showHistory;
        this.setShowHistory = setShowHistory;
        this.showEdit = showEdit;
        this.setShowEdit = setShowEdit;
        this.show2FA = show2FA;
        this.history = [];
        this.setShow2FA = setShow2FA;
        this.isEditabled = isEditabled;
    }  
   
    render() {
        

        return `
            ${Container({
                title: this.user.username,
                className: "container c-flex",
                children: `
                   <div class="profile-picture-container" >
                        <img src="${this.user.profile_picture}" alt="${this.user.username}" class="rounded-circle img-fluid profile-picture"/>
                        <div class="profile-overlay">
                            <i class="fa fa-pencil-alt"></i>
                        </div>
                    </div>
    
                    <button id="edit-infos" class="btn btn-primary my-2" >Atualizar Informações</button>
                   <div class="toggle-container">
                        <input type="checkbox" id="toggle-2fa" class="toggle-checkbox" ${this.user.is_auth ? "checked": "" }>
                        <label for="toggle-2fa" class="toggle-label" ></label>
                        <span >Autenticação de 2 Fatores</span>
                    </div>
                    <div class="text-left stats-fields">
                        <h5>Estatísticas</h5>
                        <p>Partidas Jogadas: ${this.stats.games_played}</p>
                        <p>Vitórias: ${this.stats.games_won}</p>
                        <p>Derrotas: ${this.stats.games_lost}</p>
                        <p>Torneios: ${this.stats.tournament_won} - ${this.stats.tournament_played}</p>
                    </div>
                    <button class="btn btn-primary my-2" id="history-btn" >Ver historico de partidas</button>
                `
            })}
            
            
            <div id="pop_profile" class="popup"></div>
        `;
    }

    
    async mount() {
        const {token } = authProvider.get();
        document.querySelector('.profile-picture-container').addEventListener('mouseover', () => {
            const overlay = document.querySelector('.profile-overlay');
            overlay.style.display = 'flex';
        })
        document.querySelector('.profile-picture-container').addEventListener('mouseout', () => {
            const overlay = document.querySelector('.profile-overlay');
            overlay.style.display = 'none';
        })
        document.querySelector('.profile-picture-container').addEventListener('click', () => {
            this.setShowImageEdit(true);
        })
        document.querySelector('#edit-infos').addEventListener('click', () => {
            this.setShowEdit(true);
        })
        document.querySelector('#toggle-2fa').addEventListener('change', () => {
            this.setShow2FA(true);
        })
        document.querySelector('#history-btn').addEventListener('click', () => {
            this.setShowHistory(true);
        })
        if (this.showEdit()) {
            const customContent = `
                <form class="profile-update-form">
                    <div id="responseMessage" class="mt-3"></div>
                    <input type="text" placeholder="Novo Nome de Usuário" id="username" class="form-control mb-2">
                    <input type="password" placeholder="Senha Atual" id="password" class="form-control mb-2">
                    <input type="password" placeholder="Nova Senha" id="newPassword" class="form-control mb-2">
                    <input type="password" placeholder="Confirmar Nova Senha" id="confiNewPassword" class="form-control mb-2">
                    <button class="btn save-button" type="submit" >Salvar</button>
                </form>
            `;
            const popUp = new Popup("#pop_profile", "Edite suas informações:", customContent, this.showEdit(), this.setShowEdit);
            popUp.reRender();
            const responseMessage = document.getElementById('responseMessage');
            document.querySelector('.profile-update-form').addEventListener('submit', async (event) => {
                event.preventDefault();
                try {
                    const data = {}
                    const username = document.querySelector('#username').value;
                    const password = document.querySelector('#password').value;
                    const newPassword = document.querySelector('#newPassword').value;
                    const confiNewPassword = document.querySelector('#confiNewPassword').value;
                    if (username === "" && password === "" && newPassword === "") {
                        throw new Error("Preencha pelo menos um campo");
                    }
                    if (username != "" && !validateUsername(username)) {
                        throw new Error("O nome de usuário deve ter mais de 3 caracteres");
                    } else if (username !== "") {
                        data.username = username;
                    }
                    if (newPassword !== "" && newPassword !== confiNewPassword) {
                        if (password === "") {
                            throw new Error("Prencha a senha atual");
                        }
                        throw new Error("As senhas não coincidem");
                    }
                    if (newPassword !== "" && !validatePassword(newPassword)) {
                        throw new Error("A senha deve ter pelo menos 6 caracteres, incluindo números e letras");
                    } else {
                        data.password = password;
                        data.new_password = newPassword;
                    }
                    await userProvider.updateUser(token, data);
                    this.setShowEdit(false);
                    this.re()
                } catch (err) { 
                    responseMessage.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
                }
            })
        }
        else if (this.showImageEdit()) {

            const customContent = `
            <form id="uploadForm" enctype="multipart/form-data">
            <div id="responseMessage" class="mt-3"></div>
            <label for="fileInput">Escolha um arquivo:</label>
            <input type="file" id="fileInput" name="profile_picture"  class="form-control-file" required>
            <button type="submit">Enviar</button>
            </form>
            `;
            const popUp = new Popup("#pop_profile", "Mude sua foto", customContent, this.showImageEdit(), this.setShowImageEdit);
            popUp.reRender();
            const upl = document.querySelector('#uploadForm')
            const responseMessage = document.getElementById('responseMessage');
            upl.addEventListener('submit', async (event) => {
                event.preventDefault();
                try {
                    const formData = new FormData(upl);
                    const res = await userProvider.updateProfilePicture(token, formData);
                    this.user.profile_picture = res.profile_picture;
                    this.setShowImageEdit(false);
                    this.re()
                } catch (err) {
                    responseMessage.innerHTML = `<div class="alert alert-danger">Erro ao enviar: ${err.message}</div>`
                }
            })
        } else if (this.show2FA()) {
            if (this.user.is_auth) {
                const customContent = `
                <form class="profile-2fa-form">
                    <input type="number" placeholder="Confirme o 2fa" id="confirm2fa" size="6" class="form-control mb-2">
                    <button class="btn save-button" type="submit" >Ativar</button>
                </div>`;
                const popUp = new Popup("#pop_profile", "Desativar 2FA", customContent, this.show2FA(), this.setShow2FA);
                popUp.reRender();
                document.querySelector('.profile-2fa-form').addEventListener('submit', async (event) => {
                    event.preventDefault();
                    try {
                        const confirm2fa = document.querySelector('#confirm2fa').value;
                        await userProvider.confirm2FA(token, confirm2fa);
                        this.setShow2FA(false);
                        this.re()
                    } catch (err) {
                        console.log(err);
                    }
                })
            } else {
                const customContent = `
                <div class="qr-code-container">
                    <div class="qr-code" style></div>
                </div>
                <form class="profile-2fa-form">
                    <input type="number" placeholder="Confirme o 2fa" id="confirm2fa" size="6" class="form-control mb-2">
                    <button class="btn save-button" type="submit" >Ativar</button>
                </div>
                `;
                const popUp = new Popup("#pop_profile", "Active 2FA", customContent, this.show2FA(), this.setShow2FA);
                popUp.reRender();
                let qr_code_element = document.querySelector(".qr-code");
                const generate = async (user_input) => {
                    qr_code_element.style = "";
                    new QRCode(qr_code_element, {
                        text: user_input,
                        width: 300, //128
                        height: 300,
                        colorDark: "#000",
                        colorLight: "#00e5ff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }

                try {
                    const res = await userProvider.enable2FA(token);
                    generate(res.otp_uri);
                } catch {
                    console.log("Erro ao tentar ativar 2FA")
                }
                document.querySelector('.profile-2fa-form').addEventListener('submit', async (event) => {
                    event.preventDefault();
                    try {
                        const confirm2fa = document.querySelector('#confirm2fa').value;
                        await userProvider.confirm2FA(token, confirm2fa);
                        this.setShow2FA(false);
                        this.re()
                    } catch (err) {
                        console.log(err);
                    }
                })
            }

        } else if (this.showHistory()) {
            try {
                const res = await gameProvider.history(token, this.user);
                this.history = res;
                console.log(this.history);
            } catch (err) {
                console.log(err);
                this.setShowHistory(false);
            } 
            const customContent = `
                    <div class="d-flex flex-column">
                    <div class="mt-2" id="suggested_friends" style="max-height: 200px; overflow-y: auto;">
                        <div class="modal-body">
                            <ul class="list-group">
                                ${this.history.sort((a, b) => new Date(b.end_time) - new Date(a.end_time)).slice(0, 4).map((game, idx) => `
                                    <li class="list-group-item ${game.score_player1 > game.score_player2 && game.player1_id === this.user.user_id ? "victory" : "losses"}">
                                        <div class="game-details">
                                            <p class="players">${game.player1.username} vs ${game.player2.username}</p>
                                            <span class="date">${formatDate(game.end_time)}</span>
                                            <p class="score">${game.score_player1} - ${game.score_player2}</p>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            const popUp = new Popup("#pop_profile", "Historico de Partidas", customContent, this.showHistory(), this.setShowHistory);
            popUp.reRender();
        }
    }
}