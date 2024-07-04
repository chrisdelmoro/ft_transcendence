
import Component from '../../../react/Component.js';

class SoundControl extends Component {
  constructor(to, audioSrc) {
    super(to);
    this.audioSrc = audioSrc;
    this.init();
}
  init() {
    const [isPlaying, setIsPlaying] = this.useState(false);
    this.isPlaying = isPlaying;
    this.setIsPlaying = setIsPlaying;
  }

  render() {
      return `
          <div id="container-sound-icon" class="sound-icon">
              <img id="sound-icon" src="${this.isPlaying() ? 'https://img.icons8.com/ios-glyphs/30/00ffea/musical-notes.png' : 'https://img.icons8.com/ios-glyphs/30/00ffea/mute.png'}" alt="Sound Icon" />
              <audio id="background-music" loop ${this.isPlaying() ? "autoPLay" : ""}>
                  <source src="${this.audioSrc}" type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
              </audio>
          </div>
      `;
  }

  mount() {
      document.getElementById('container-sound-icon').addEventListener('click', () => {
          this.setIsPlaying(!this.isPlaying());
      });
  }
}

export default SoundControl;