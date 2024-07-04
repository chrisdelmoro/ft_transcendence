import Component from '../../../react/Component.js';
import authProvider from '../../provider/authProvider.js';
import { validateEmail, validatePassword, validateUsername } from '../../utils/Validation.js';

class RegisterForm extends Component {
    constructor(to) {
        super(to);
        this.init();
    }

    init() {
        const [email, setEmail] = this.useState('');
        const [username, setUsername] = this.useState('');
        const [password, setPassword] = this.useState('');
        const [confirmPassword, setConfirmPassword] = this.useState('');
        this.email = email;
        this.setEmail = setEmail;
        this.password = password;
        this.setPassword = setPassword;
        this.username = username;
        this.setUsername = setUsername;
        this.confirmPassword = confirmPassword;
        this.setConfirmPassword = setConfirmPassword;
    }

    

    render() {
        return `
            <form id="register-form">
                <div id="error-message" class="text-danger"></div>
                <div class="form-group">
                    <input type="email" class="form-control" id="email" placeholder="Email" value="${this.email()}" required>
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" id="username" autocomplete="username" placeholder="Username" value="${this.username()}" required>
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" id="password" autocomplete="new-password" placeholder="Nova Senha" value="${this.password()}" required>
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" id="confirmedPassword" autocomplete="new-password" placeholder="Confirme Senha" value="${this.confirmPassword()}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="background-color: #00e5ff; border: none;">Registrar</button>
            </form>
        `;
    }

    mount() {
        const emailInput = document.getElementById('email');
        const username = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmedPassword = document.getElementById('confirmedPassword');
        const errorMessage = document.getElementById('error-message');

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';

            // Validação dos campos
            if (!this.email() || !this.username() || !this.password() || !this.confirmPassword()) {
                errorMessage.textContent = 'Por favor, preencha todos os campos.';
                return;
            }

            // Verificar se o email é válido
            if (!validateEmail(this.email())) {
                errorMessage.textContent = 'Por favor, insira um email válido.';
                return;
            }

            // Verificar se o nome de usuário é válido
            if (!validateUsername(this.username())) {
                errorMessage.textContent = 'O nome de usuário deve ter mais de 3 caracteres.';
                return;
            }

            // Verificar se a senha é válida
            if (!validatePassword(this.password())) {
                errorMessage.textContent = 'A senha deve ter pelo menos 6 caracteres, incluindo números e letras.';
                return;
            }

            // Verificar se as senhas são iguais
            if (this.password() !== this.confirmPassword()) {
                errorMessage.textContent = 'As senhas não coincidem.';
                return;
            }
            try {
                const res = await authProvider.createAccount(this.username(), this.email(), this.password())
                if (res.status === 201) {
                    window.location.href = '/';
                }
            }catch(err) {
                errorMessage.textContent = "usuario already existis";
            }
        });

        emailInput.addEventListener('input', (e) => {
            this.setEmail(e.target.value);
        });

        username.addEventListener('input', (e) => {
            this.setUsername(e.target.value);
        });

        passwordInput.addEventListener('input', (e) => {
            this.setPassword(e.target.value);
        });
        
        confirmedPassword.addEventListener('input', (e) => {
            this.setConfirmPassword(e.target.value);
        })
    }
}

export default RegisterForm;