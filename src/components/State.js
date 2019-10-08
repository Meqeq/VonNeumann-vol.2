import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../styles/state.scss';

class State extends Component {
    getMachineState() {
        switch(this.props.machineState) {
            case 'waiting':
                return "Wprowadź kod";
            case 'ready':
                return "Skompiluj";
            case 'compiled':
                return "Skompilowano";
            case 'runing':
                return "Runn-nn-ning";
            case 'end':
                return "Zakończono";
            case 'error':
                return "Błąd";
            default:
                return "Stan nieznany";
        }
    }

    render() {
        return(
            <div className="state">
                <div className="label">Stan</div>
                <div className={ "machine-state " + this.props.machineState }>
                    { this.getMachineState() }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return { machineState: state.vn.machineState }
};

export default connect(mapStateToProps)(State);