import Component from "../../../react/Component.js";
import Container from "../../components/containers/index.js";
import TopBar from "../../components/topBar/topBar.js";
import Footer from "../../components/footer/index.js";
import StartTournament from "./startTournament.js";
import userProvider from "../../provider/userProvider.js";
import authProvider from "../../provider/authProvider.js";
import tournamentProvider from "../../provider/tournamentProvider.js";
import ClassificationTournament from "./classificationTournament.js";
import PodiumTournament from "./podiumTournament.js";



class Tournament extends Component {
    constructor(to) {
        super(to);
        this.init();
    
    }
    init() { 
       

    }
  
    render () {
      return `
        <nav id="top_bar" class="navbar navbar-expand navbar-custom"> </nav>
        <div class="page">
        </div>
        ${Footer()}
      `
    }
  
    async mount () {
        const {token} = authProvider.get();
        await userProvider.getUser(token).catch((err) => {
            console.log(err)
            authProvider.logout();
            return navigateTo('/')
        }); 
        const {user} = userProvider.get();
        const {tournament_id, tournament} = tournamentProvider.get();
        if (tournament_id === null) {
            await tournamentProvider.createTournament(token, user).then(() => {
                this.reRender();
            }).catch((err) => {
                return navigateTo('/home')
            })
        }
        const topBar = new TopBar('#top_bar', false);
        topBar.reRender();
        if (tournament === undefined) {
            return this.reRender()
        }
        if (tournament.status === "Created") {
          const startTournament = new StartTournament('.page', this.reRender.bind(this));
          startTournament.reRender();
        } else if (tournament.status === "Started") {
          const classificationTournament = new ClassificationTournament('.page', this.reRender.bind(this));
          classificationTournament.reRender();
        } else if (tournament.status === "finished") {
          const podiumTournament = new PodiumTournament('.page');
          podiumTournament.reRender();
        } else {
          return navigateTo('/home')
        }
    }
  }
  
export default Tournament;