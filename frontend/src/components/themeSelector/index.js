import Component from '../../../react/Component.js';
import Popup from '../popup/popup.js';

const themes = [
    { name: 'original', color: '#fff' },
    { name: 'model1', color: '#ff69b4' },
    { name: 'model2', color: '#00ff00' }
];

const colors = [
  "#fff", "#ff69b4", "#00ff00", "#ff4500", " #1e90ff"
]


const Bckcolor = [
  "#000", "#ff69b4", "#00ff00", "#ff4500", " #1e90ff"
]

class ThemeSelector extends Component {
    constructor(to, onThemeChange, selectedTheme, color) {
        super(to);
        const [showPopup, setShowPopup] = this.useState(false);
        const [customTheme, setCustomTheme] = this.useState(color)
        this.customTheme = customTheme;
        this.setCustomTheme = setCustomTheme;
        this.onThemeChange = onThemeChange;
        this.selectedTheme = selectedTheme;
        this.showPopup = showPopup;
        this.setShowPopup = setShowPopup;
    }


  handleThemeChange(new_themes) {
    this.selectedTheme = new_themes.theme;
    this.onThemeChange( {
      theme: new_themes.theme,
      paddleColor: new_themes.paddleColor,
      ballColor: new_themes.ballColor,
      backgroundColor: new_themes.backgroundColor
    });
  }


    render() {
        return `
            <div class="theme-selector">
                ${themes.map(theme => `
                <div class="theme ${theme.name} ${this.selectedTheme === theme.name ? 'selected' : ''}">
                  <canvas id="${theme.name}Canvas" width="80" height="80"></canvas>
              </div>
                  `).join('')}
                <div class="theme customize  ${this.selectedTheme === "customize" ? 'selected' : ''}" >
                    <img src="https://img.icons8.com/ios-filled/50/00ffea/settings.png" alt="Customizar">
                </div>
            </div>
            <div class="popup thema"> </div>
        `;
    }
    mount() {
      let customContent = `
      <div>
        <div class="message">Escolha a cor da raquete:</div>
        <div class="color-picker">
          ${colors.map((color, idx) => ` <div id="paddle_${idx}" class="${color === this.customTheme().paddleColor ? "selected": "" }" style="background: ${color}"> </div>`).join('')}
        </div>
        <div class="message">Escolha a cor da bola:</div>
        <div class="color-picker">
          ${colors.map((color, idx) => ` <div id="ball_${idx}" class="${color === this.customTheme().ballColor ? "selected": "" }" style="background: ${color} "> </div>`).join('')}
        </div>
        <div class="message">Escolha a cor do background:</div>
        <div class="color-picker">
          ${Bckcolor.map((color, idx) => ` <div id="background_${idx}" class="background  ${color === this.customTheme().backgroundColor ? "selected": "" }" style="background: ${color}"> </div>`).join('')}  
        </div>
        </div>
          <button id="save_custom" class="btn save-button" >Salvar</button>
        </div>
        `;
        const popUp = new Popup(".thema", "Escolha a cor da raquete:", customContent, this.showPopup(), this.setShowPopup);
        popUp.reRender();
        themes.forEach(theme => {
          const canvas = document.getElementById(`${theme.name}Canvas`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.globalAlpha = 0.1;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Draw paddles and ball (example)
                ctx.globalAlpha = 1;
                ctx.fillStyle = theme.color;
                ctx.fillRect(10, 15, 5, 55); // left paddle
                ctx.fillRect(65, 15, 5, 55); // right paddle
                ctx.fillRect(35, 35, 10, 10); // ball
          }
          document.querySelector(`.${theme.name}`).addEventListener('click', () => {
              this.handleThemeChange({
                theme: theme.name,
                paddleColor: theme.color,
                ballColor: theme.color,
                backgroundColor: '#000'
              });
          });
        });
        document.querySelector(`.customize`).addEventListener('click', () => {
          this.selectedTheme = "customize";
          this.setCustomTheme({
            theme: 'customize',
            paddleColor: this.customTheme().paddleColor,
            ballColor: this.customTheme().ballColor,
            backgroundColor: this.customTheme().backgroundColor
          })
          this.setShowPopup(true);
        });
        if (this.showPopup() ) {
          colors.forEach((color, idx) => {
            document.querySelector(`#paddle_${idx}` ).addEventListener('click', () => {
              const custom  = this.customTheme();
              this.setCustomTheme({
                theme: 'customize',
                paddleColor: color,
                ballColor: custom.ballColor,
                backgroundColor: custom.backgroundColor
              });
            })
            document.querySelector(`#ball_${idx}`).addEventListener('click', () => {
              const custom  = this.customTheme();
              this.setCustomTheme({
                theme: 'customize',
                paddleColor: custom.paddleColor,
                ballColor: color,
                backgroundColor: custom.backgroundColor
              });
            })
            document.querySelector(`#background_${idx}`).addEventListener('click', () => {
              const custom  = this.customTheme();
              this.setCustomTheme({
                theme: 'customize',
                paddleColor: custom.paddleColor,
                ballColor: custom.ballColor,
                backgroundColor: Bckcolor[idx]
              });
            })
          })
          document.querySelector("#save_custom").addEventListener('click', () => {
            this.setShowPopup(false);
            this.onThemeChange(this.customTheme());
          })
        }
        

    }
}

export default ThemeSelector;
