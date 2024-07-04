
import Component from '../../../react/Component.js';
import SoundControl from '../../components/soundControl/index.js';
import BackgroundAnimation from '../../components/backgroundAnimation/backgroundAnimation.js';
import Container from '../../components/containers/index.js';
import RegisterForm from './registerFrom.js';

class SingUp extends Component {
    constructor(to) {
        super(to);
    }

    init() {
      
    }

    render() {
      return `
      <div class="login">
            ${BackgroundAnimation()}
              <div id="sound-control-container"></div>
              ${Container({
                title: "Login Pong",
                className: "login-container",
                children : `
                <div id="register-form-container"></div>
                <p> Já possui uma conta? <a href="/">Faça login</a></p>
                      `
              })}
          </div>
      `;
  }

  mount() {
      const soundControl = new SoundControl('#sound-control-container', 'assets/sounds/music.m4a');
      soundControl.reRender();

      const register = new RegisterForm('#register-form-container');
      register.reRender();
  }
}

export default SingUp;