class TournamentProvider {
    constructor() {
        if (TournamentProvider.instance) {
            return TournamentProvider.instance;
        }
        this.tournament_id = sessionStorage.getItem("tournament_id");
        if (this.tournament_id !== null) {
            this.tournament_player = JSON.parse(sessionStorage.getItem("tournament_player"));
            this.tournament =JSON.parse(sessionStorage.getItem("tournament"));
        } else {
            this.tournament_player = [{token: null}, {token: null}, {token: null}, {token: null},
                {token: null}, {token: null}, {token: null}, {token: null}];
        }
        TournamentProvider.instance = this;
    }

    async feed_tournament(token) {
        const res = await fetch(window.env["API_URL"] + `protected/tournament/${this.tournament_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if (res.status === 200) {
            const data = await res.json();
            this.tournament_player.filter((pl)=> pl.token !== null).forEach((player, index) => {
                const pl = data.participants.find((pl) => player.user.user_id === pl.user_id)
                this.tournament_player[index].user.wins = pl.wins;
                this.tournament_player[index].user.score = pl.score;
                this.tournament_player[index].user.losses = pl.losses;
            });
            this.tournament = data;
            sessionStorage.setItem("tournament_player", JSON.stringify(this.tournament_player));
            sessionStorage.setItem("tournament", JSON.stringify(data));
            return data;
        } else 
            throw new Error("Erro ao buscar torneio");
    }

    get() {
        return {tournament_player: this.tournament_player, tournament_id: this.tournament_id, tournament: this.tournament};
    }

    async createTournament(token, user) {
        const res = await fetch(window.env["API_URL"] + 'protected/tournament/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
        }})
        if (res.status === 201) {
            const data = await res.json();
            this.tournament_player[0] = {token: token, user: user};
            this.tournament_id = data.tournament.id;
            this.tournament = data.tournament;
            sessionStorage.setItem("tournament_id", data.tournament.id);
            sessionStorage.setItem("tournament_player", JSON.stringify(this.tournament_player));
            sessionStorage.setItem("tournament", JSON.stringify(this.tournament));
            return data;
        }else 
            throw new Error("Erro ao criar torneio");
    }

    async addPlayer(id, token, idx) {
        const res = await fetch(window.env["API_URL"] + `protected/tournament/participants/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }})
        if (res.status === 200) {
            const data = await res.json();
            const player = await fetch(window.env["API_URL"] + `protected/user/findById/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (player.status === 200) {
                const playerData = await player.json();
                this.tournament_player[idx] = {token: token, user: playerData};
                sessionStorage.setItem("tournament_player", JSON.stringify(this.tournament_player));
            }
            return data;
        }else 
            throw new Error("Erro ao adicionar jogador");
    }

    async startTournament(token) {
        const res = await fetch(window.env["API_URL"] + `protected/tournament/start_tournament/${this.tournament_id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if (res.status === 200) {
            const data = await res.json();
            this.tournament.status = "Started";
            sessionStorage.setItem("tournament", JSON.stringify(this.tournament));
            return data;
        } else 
            throw new Error("Erro ao iniciar torneio");
    }

    async getNextMatch(token) {
        const res = await fetch(window.env["API_URL"] + `protected/tournament/next_match/${this.tournament_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if (res.status === 200) {
            const data = await res.json();
            return data;
        } else 
            throw new Error("Erro ao buscar proxima partida");
    }

    getPlayers(game) {
        const player1 = this.tournament_player.find((player) => player.token !== null && player.user.user_id === game.game.player1.user_id);
        const player2 = this.tournament_player.find((player) => player.token !== null && player.user.user_id === game.game.player2.user_id);
        return {player1, player2};
    }
    reset() {
        sessionStorage.removeItem("tournament_id");
        sessionStorage.removeItem("tournament_player");
        sessionStorage.removeItem("tournament");
        this.tournament_id = null;
        this.tournament_player = [{token: null}, {token: null}, {token: null}, {token: null},
            {token: null}, {token: null}, {token: null}, {token: null}];
        this.tournament = undefined;
    }
}


const tournamentProvider = new TournamentProvider();
export default tournamentProvider;