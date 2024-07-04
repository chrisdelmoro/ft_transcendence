
import Component from '../../../react/Component.js';
import Container from '../../components/containers/index.js';
import TopBar from "../../components/topBar/topBar.js"
import authProvider from "../../provider/authProvider.js";
import userProvider from "../../provider/userProvider.js";
import MainVsAI from "../../components/mainVsAI/index.js";
import Footer from "../../components/footer/index.js";
import gameProvider from "../../provider/gameProvider.js";
class VsAI extends Component {
    constructor(to) {
        super(to);
        this.side = "left";
      }

    render() {
      return `
      <nav id="top_bar" class="navbar navbar-expand-lg navbar-custom"> </nav>
      <div class="page_final">
      ${Container({
        title: "Trainig Mode",
        className: "container grid-container ",
        children : `
        <div class="container-my-vsai">
        ${Container({
          title: "",
          className: "vsai-container-p1",
          children : `<div class="container-player" id="player1"></div>`
        })}
        ${Container({
          title: "",
          className: "vsai-container-p2",
          children : `<div class="container-player" id="playerAI"></div>`
        })}
          </div>
        <button id="start-game" class="btn btn-primary btn-block" style="background-color: #00e5ff; border: none; margin-top:20px;">Start Game</button>
        `
        })}
      </div>
      ${Footer()}`;
  }

  async mount() {

    const {_, token} = authProvider.get()

    await userProvider.getUser(token).then((res) => {
    }).catch((err) => {
      console.log(err)
      authProvider.logout();
     return navigateTo('/')
    });

    const topBar = new TopBar('#top_bar', false);
    topBar.reRender();

    const {apperance, user} = userProvider.get();
    const player1 = new MainVsAI('#player1', apperance, true)
    player1.reRender();
    const playerAI = new MainVsAI('#playerAI', apperance, false)
    playerAI.reRender();

    document.querySelector("#start-game").addEventListener("click", () => {
      gameProvider.setGameAi(this.side)
      return navigateTo('/game')
    });
  }

}

export default VsAI;