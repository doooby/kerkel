import preact from 'preact';
import actions from '../../../actions';

export default class PendingGameForm extends preact.Component {

    constructor(props) {
        super(props);

        // this.onNameChanged = this.onNameChanged.bind(this);
        // this.onSubmit = this.onSubmit.bind(this);

    }

    render ({game}) {


        if (game.host) {
            return <div>
hostuješ


            </div>;


        }

        return <div>
            jsi vyzván
        </div>;
    }



}