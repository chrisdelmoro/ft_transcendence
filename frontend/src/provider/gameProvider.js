class GameProvider {
    constructor() {
        if (GameProvider.instance) {
            return GameProvider.instance;
        }
        this.game = sessionStorage.getItem("game") ? JSON.parse(sessionStorage.getItem("game")) : undefined;
        this.player1 = sessionStorage.getItem("player1") ? JSON.parse(sessionStorage.getItem("player1")) : undefined;
        this.player2 = sessionStorage.getItem("player2") ? JSON.parse(sessionStorage.getItem("player2")) : undefined;
        GameProvider.instance = this;
        this.playerSide = sessionStorage.getItem("playerSide") ? JSON.parse(sessionStorage.getItem("playerSide")) : undefined;
    }

    get() {
        return {game: this.game, player1: this.player1, player2: this.player2, side: this.playerSide};
    }

    setGameAi(side) {
        this.game = {
            score_player1: 0,
            score_player2: 0,
            status: "active",
            type: "ai"
        }
        this.playerSide = side;
        sessionStorage.setItem("playerSide", JSON.stringify(side));
        sessionStorage.setItem("game", JSON.stringify(this.game));
    }

    async createGame(token, player1, player2) {
        const res = await fetch(window.env["API_URL"] + 'protected/game/start_game/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                player1_id: player1.user_id,
                player2_id: player2.user_id,
                "status": "active",
                "type": "friendly",
            })
        })
        if (res.status === 200) {
            const data = await res.json();
            this.game = data.game;
            this.player1 = player1;
            this.player2 = player2;
            sessionStorage.setItem("game", JSON.stringify(data.game));
            sessionStorage.setItem("player1", JSON.stringify(player1));
            sessionStorage.setItem("player2", JSON.stringify(player2));
            return data.game;
        } else 
            throw new Error("Erro ao criar jogo");

    }

    async setGame(token, game_id, player1, player2) {
        const game = await fetch(window.env["API_URL"] + `protected/game/get_game/${game_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if (game.status === 200) { 
            const data = await game.json();
            this.game = data;
            this.player1 = player1.user;
            this.player2 = player2.user;
            sessionStorage.setItem("game", JSON.stringify(data));
            sessionStorage.setItem("player1", JSON.stringify(player1.user));
            sessionStorage.setItem("player2", JSON.stringify(player2.user));
            return data;
        } else 
            throw new Error("Erro ao buscar jogo");
    }

    async setScore(token, player) {
        const data = {
            score_player1: this.game.score_player1,
            score_player2: this.game.score_player2,
        }
        if (this.game.score_player1 === 5 || this.game.score_player2 === 5) {
            data.end = true;
            this.game.status = "ended";
            data.winner = this.game.score_player1 === 5 ? this.player1.user_id : this.player2.user_id;
        }
        const score = fetch(window.env["API_URL"] + `protected/game/update_game/${this.game.game_id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        if (score.status === 200) {
            const res = await score.json();
            if (data.end) {
                return res;
            }
            sessionStorage.setItem("game", JSON.stringify(res.game));
            return res;
        }
    }
    reset() {
        this.game = undefined;
        this.player1 = undefined;
        this.player2 = undefined;
        this.playerSide = undefined;
        sessionStorage.removeItem("game");
        sessionStorage.removeItem("player1");
        sessionStorage.removeItem("player2");
        sessionStorage.removeItem("playerSide");
    
    }

    async history(token, user) {
            const res = await fetch(window.env["API_URL"] + 'protected/game/history/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                const result = []
                for (const game of data) {
                    if (game.player1_id !== user.user_id) { 
                        const player1 = await fetch(window.env["API_URL"] + `protected/user/findById/${game.player1_id}/`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        if (player1.status === 200) {
                            game.player2 = user
                            game.player1 = await player1.json();
                        } else {
                            throw new Error("Erro ao buscar jogador");
                        }
                    } else {
                        const player1 = await fetch(window.env["API_URL"] + `protected/user/findById/${game.player2_id}/`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        if (player1.status === 200) {
                            game.player2 = await player1.json();
                            game.player1 = user
                        } else {
                            throw new Error("Erro ao buscar jogador");
                        }
                    }
                    result.push(game);
                }
                return result;
            } else 
                throw new Error("Erro ao buscar histórico");
    }
}


const gameProvider = new GameProvider();
export default gameProvider;