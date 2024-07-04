import Component from "../../../react/Component.js";
import tournamentProvider from "../../provider/tournamentProvider.js";
import gameProvider from "../../provider/gameProvider.js";
import authProvider from "../../provider/authProvider.js";

export default class ClassificationTournament extends Component {
  constructor(props, re) {
    super(props);
    this.re = re;
    this.frame = 0;
  }

  render() {
    const {tournament_player} = tournamentProvider.get();
    return `
      <div class="container classification">
        <h2 class="text-center mb-4">Game Matches</h2>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Ranking</th>
                    <th scope="col">Participante</th>
                    <th scope="col">Pontuação</th>
                    <th scope="col">Jogos</th>
                </tr>
            </thead>
            <tbody>
            ${tournament_player.filter((player) => player.token !== null).map((player, idx) => {
              return `
               <tr>
                    <th scope="row">${idx + 1}</th>
                    <td>${player.user.username}</td>
                    <td>${player.user.score}</td>
                    <td>${player.user.wins}-${player.user.losses}</td>
                </tr>
              `
            }).join('')}
            </tbody>
        </table>
        <div class="text-center mt-4">
            <button class="btn btn-primary" id="next-match-btn">Next Match</button>
        </div>
    `;
  }

  async mount() {
      try {
        await tournamentProvider.feed_tournament(authProvider.get().token)
        if (this.frame == 0) {
          this.frame++
          return this.reRender()
        }
      }catch (err) {
        console.log(err)
      }
      this.frame = 0;
      document.getElementById('next-match-btn').addEventListener('click', async () => {
          const {token} = authProvider.get();
          document.getElementById('next-match-btn').disabled = true;
          try {
            const nextMatch = await tournamentProvider.getNextMatch(token)
            if (nextMatch) {
              if (nextMatch.status === 'finished') {
                this.reRender()
                return this.re()
              }
              const {player1, player2} = tournamentProvider.getPlayers(nextMatch);
              await gameProvider.setGame(token, nextMatch.game.game_id, player1, player2)
              return navigateTo('/game')
            }
          }
          catch (err) {
            document.getElementById('next-match-btn').disabled = false;
            console.log(err)
          }
   });
  }
}