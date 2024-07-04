
class AuthProvider {
    constructor() {
        if (AuthProvider.instance) {
            return AuthProvider.instance;
        }
        this.user = {};
        this.authenticated = false;
        this.token = sessionStorage.getItem("token");
        AuthProvider.instance = this;
    }


    get() {
        return {auth: this.authenticated, token: this.token};
    }

    async validate2fa(code, email, isTour = undefined) {
        const res = await fetch(window.env["API_URL"] + 'public/auth/login/code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: code,
                    email: email
                })
            })
            if (res.status === 200) {
                const data = await res.json();
                if (data["jwt_token"] !== undefined && isTour === undefined) {
                    sessionStorage.setItem("token", data["jwt_token"]);
                }
                return data;
            } else {
                throw new Error("Erro ao validar 2fa");
            }

    }

    async changeStatus(status) {
        const res = await fetch(window.env["API_URL"] + `protected/user/${status}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }})
        if (res.status === 200) {
            return res;
        }
        else 
            throw new Error("Erro ao atualizar status online");
    }

    async login(username, password, isTour = undefined) {
            const res = await fetch(window.env["API_URL"] + 'public/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            if (res.status === 200) {
                const data = await res.json();
                if (data["jwt_token"] !== undefined && isTour === undefined) {
                    sessionStorage.setItem("token", data["jwt_token"]);
                }
                return data;
            } else {
                throw new Error("Erro ao logar");
            }
    }

    async login42(code, isTour = undefined, isPvp = undefined) {
        let redict = ""
        if (isTour) {
            redict = "tournament"
        }
        if (isPvp) {
            redict = "pvp"
        }
        const res = await fetch(window.env["API_URL"] + 'public/auth/oauth2/authorize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: window.env["REDIRECT_URL"] + redict
            })
        })
        if (res.status === 200) {
            const data = await res.json();
            if (data["jwt_token"] !== undefined && isTour === undefined) {
                sessionStorage.setItem("token", data["jwt_token"]);
            }
            return data;
        } else {
            throw new Error("Erro ao logar com 42");
        }
}

    async createAccount(username, email, password) {
        const res = await fetch(window.env["API_URL"] + 'public/user/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        if (res.status === 201) {
            return res;
        }
        throw new Error("Erro ao criar conta");
    }

    async isAuthenticated(token) {
        if (token === undefined) {
            this.token = sessionStorage.getItem("token");
        }
        if (this.token === undefined) {
            return false;
        }
        if (this.authenticated === false) {
            try {
                await this.changeStatus("online");
                this.authenticated = true;    
            } catch (err) {
                console.log(err);
                return false;
            }
        }
        return true;
    }

    async logout() {
        sessionStorage.removeItem("token");
        this.authenticated = false;
    }
}

const authProvider = new AuthProvider();
export default authProvider;