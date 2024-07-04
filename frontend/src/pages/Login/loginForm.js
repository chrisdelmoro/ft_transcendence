import Component from '../../../react/Component.js';
import Popup from '../../components/popup/popup.js';
import authProvider from '../../provider/authProvider.js';
import tournamentProvider from '../../provider/tournamentProvider.js';

class LoginForm extends Component {
    constructor(to, isTournament = undefined, isPvp = undefined) {
        super(to);
        this.isPvp = isPvp;
        this.isTournament = isTournament;
        const urlParams = new URLSearchParams(window.location.search);
        this.code = urlParams.get("code");
        this.init();
    }

    init() {
        const [email, setEmail] = this.useState('');
        const [password, setPassword] = this.useState('');
        const [showEdit, setShowEdit] = this.useState(false);
        this.email2fa = "";
        this.showEdit = showEdit;
        this.setShowEdit = setShowEdit;
        this.email = email;
        this.setEmail = setEmail;
        this.password = password;
        this.setPassword = setPassword;
    }

    render() {
        return `
            <div class="popup_form_login" id="login_popup"> </div>
            <form id="login-form">
                <div id="error-message" class="text-danger"></div>
                <div class="form-group">
                    <input type="text" autocomplete="username" class="form-control" id="email" placeholder="Username" value="${this.email()}" required>
                </div>
                <div class="form-group">
                    <input type="password" autocomplete="current-password" class="form-control" id="password" placeholder="Senha" value="${this.password()}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="background-color: #00e5ff; border: none;">Login</button>
                <button type="button" class="btn btn-dark btn-block" style="margin-top: 10px;">Login com 42</button>
            </form>
        `;
    }

    async mount() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');
        if (this.code !== null) {
            try {
                const res = await authProvider.login42(this.code, this.isTournament, this.isPvp)
                this.code = null;
                const url = new URL(window.location);
                url.searchParams.delete("code");
                window.history.replaceState({}, document.title, url.toString());
                if (res.email !== undefined) {
                    this.email2fa = res.email
                    this.setShowEdit(true);
                }
                else {
                    if (!this.isTournament) {
                        return navigateTo('/home')
                    }
                    await this.isTournament(res.jwt_token)
                }
            } catch (err) {
                errorMessage.textContent = 'Erro tente novamente!';
            }
        }
        if (this.showEdit()) {
            const content = `
            <form id="2fa-form">
                <div id="error-message-2fa" class="text-danger"></div>
                <div class="form-group">
                    <input type="text"  autocomplete="one-time-code" class="form-control" id="2fa-code" placeholder="2FA Code" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="background-color: #00e5ff; border: none;">Login</button>
            </form>
            `
            const popUp = new Popup(".popup_form_login", "Digite o Codigo de Segurança:", content, this.showEdit(), this.setShowEdit, this.isTournament);
            popUp.reRender();
            const errorMessage2fa = document.getElementById('error-message-2fa');
            document.getElementById('2fa-form').addEventListener('submit', async (event) => {
                event.preventDefault();
                try {
                    const code = document.getElementById('2fa-code').value;
                    const res = await authProvider.validate2fa(code, this.email2fa, this.isTournament);
                    if (res.jwt_token !== undefined) {
                        if (this.isTournament === undefined) {
                            return navigateTo('/home')
                        }
                        await this.isTournament(res.jwt_token)
                    }
                }catch (err) {
                    errorMessage2fa.textContent = 'Código de segurança inválido';
                }
            } )

        }
        const login = document.getElementById('login-form')
        if (login === undefined || login === null) {
            return;
        }
        login.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.email() === '' || this.password() === '') {
                this.errorMessage = 'Por favor, preencha todos os campos.';
            }
            try {
                const res = await authProvider.login(this.email(), this.password(), this.isTournament)
                if (res.email !== undefined) {
                    this.email2fa = res.email
                    this.setShowEdit(true);
                }
                else {
                    if (this.isTournament === undefined) {
                        return navigateTo('/home')
                    } 
                    await this.isTournament(res.jwt_token)
                }
            } catch(err) {
                errorMessage.textContent = 'Usuário ou senha inválidos';
            }       
        });

        emailInput.addEventListener('input', (e) => {
            this.setEmail(e.target.value);
        });

        passwordInput.addEventListener('input', (e) => {
            this.setPassword(e.target.value);

        }); 

        const login42 = async () => {
            const clientID = window.env["CLIENT_ID_42"]
            var redirect = "https://localhost/"
            if (this.isTournament !== undefined) {
                redirect = "https://localhost/tournament"
            } 
            if (this.isPvp !== undefined) {
                redirect = "https://localhost/pvp"
            }
            const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code`;
            window.location.href = authUrl;
        }

        document.querySelector('.btn-dark').addEventListener('click', login42);
    }
}

export default LoginForm;