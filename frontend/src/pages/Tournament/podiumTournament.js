import Component from "../../../react/Component.js";
import tournamentProvider from "../../provider/tournamentProvider.js";


export default class  PodiumTournament extends Component {
    constructor(to) {
        super(to);
    }

    render() {
        const {tournament_player} = tournamentProvider.get();
        const winner = tournament_player.filter(pl => pl.token !== null).sort((a, b) => b.user.score - a.user.score);
        return `
        <div class="container podium-final">
            <div class="congrats">Parabéns aos Vencedores!</div>
        
            <div class="podium">
                <div class="place second">
                    <img src="${winner[1].user.profile_picture}" alt="${winner[1].user.username}">
                    <p>${winner[1].user.username}</p>
                </div>
                <div class="place first">
                    <img src="${winner[0].user.profile_picture}" alt="${winner[0].user.username}">
                    <p>${winner[0].user.username}</p>
                </div>
                <div class="place third">
                    <img src="${winner[2].user.profile_picture}" alt="${winner[2].user.username}">
                    <p>${winner[2].user.username}</p>
                </div>
            </div>
            <button class="btn btn-primary" id="back-to-home">Back to Home</button>
            <div class="confetti" id="confetti"></div>
        </div>
        `;
    }

    async mount() {
        document.getElementById('back-to-home').addEventListener('click', () => {
            tournamentProvider.reset();
            return navigateTo('/home');
        })
        function createConfettiPiece() {
			const confetti = document.getElementById('confetti');
			const piece = document.createElement('div');
			piece.classList.add('confetti-piece');
			piece.style.left = Math.random() * 100 + 'vw';
			piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
			confetti.appendChild(piece);
		}

		for (let i = 0; i < 100; i++) {
			createConfettiPiece();
		}
    }
}