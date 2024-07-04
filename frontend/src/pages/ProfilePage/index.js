
import Component from "../../../react/Component.js";
import Footer from "../../components/footer/index.js";
import ProfileContainer from "../../components/profileContainer/index.js";
import TopBar from "../../components/topBar/topBar.js"
import authProvider from "../../provider/authProvider.js";
import userProvider from "../../provider/userProvider.js";

class Profile extends Component {
  constructor(to) {
    super(to);
    this.init();
  }

  init() {
  
  }

  render () {
    return `
      <nav id="top_bar" class="navbar navbar-expand-lg navbar-custom"> </nav>
      <div id="content_profile"></div>
      ${Footer()} 
    `
  }

  async mount () {
    const {token} = authProvider.get()
    await userProvider.getUser(token).then((res) => {
    }).catch((err) => {
      authProvider.logout();
      navigateTo('/')
    }); 
    const topBar = new TopBar('#top_bar', false);
    topBar.reRender();
    const profile = new ProfileContainer('#content_profile', true, this.reRender.bind(this));
    await profile.reRender();
  }
}


export default Profile;