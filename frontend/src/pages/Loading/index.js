import Component from "../../../react/Component.js";

class Loading extends Component{
    constructor(to) {
        super(to);
    }

    render() {
       return  `
            <div class="loading">
                <p>Carregando...</p>
            </div>
        `;
    }
}

export default Loading;
