import Component from "../../../react/Component.js";
import MainPage from "../../components/mainPage/index.js";
import TopBar from "../../components/topBar/topBar.js"
import authProvider from "../../provider/authProvider.js";
import userProvider from "../../provider/userProvider.js";

class Home extends Component {
  constructor(to) {
    super(to);
    this.init();
  }
  init() { 
    
  }

  render () {
    return `
      <nav id="top_bar" class="navbar navbar-expand navbar-custom"> </nav>
      <div id="Content_home"></div> 
    `
  }

  async mount () {
    const {_, token} = authProvider.get()
    await userProvider.getUser(token).then((res) => {
    }).catch((err) => {
      authProvider.logout();
      navigateTo('/')
    }); 
    
    const { apperance} = userProvider.get();
    const topBar = new TopBar('#top_bar', true);
    topBar.reRender();
    const mainPage = new MainPage('#Content_home', apperance)
    mainPage.reRender();
  
  }
}


export default Home;