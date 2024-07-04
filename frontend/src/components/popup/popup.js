import Component from '../../../react/Component.js';

class Popup extends Component {
    constructor(to, title, content, show, onClose, isTour = undefined) {
        super(to);
        this.isTour = isTour;
        this.title = title;
        this.content = content;
        this.show = show;
        this.onClose = onClose;
    }

    render() {
        return this.show ? `
            <div class="popup-overlay ${this.isTour !== undefined ? "greater_zindex": ""}">
                <div class="popup-content" onclick="event.stopPropagation()">
                    <div class="popup-header">
                        <h4>${this.title}</h4>
                    </div>
                    <div class="popup-body">
                        ${this.content}
                    </div>
                </div>
            </div>
        ` : '';
    }
    mount() {
        if(this.show){
            document.querySelector(".popup-overlay").addEventListener("click", () => {
                this.onClose(!this.show);
            });
        }
        if (this.isTour !== undefined) {
            document.querySelector(".greater_zindex").addEventListener("click", (event) => {
                this.onClose(!this.show);
            })
        }
    }
}

export default Popup;
