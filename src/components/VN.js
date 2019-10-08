import React, { Component } from 'react';
import { connect } from 'react-redux';

import Memory from './Memory';
import Editor from './Editor';
import State from './State';
import Log from './Log';

import { compileAction, stepAction, runAction } from '../actions/vnActions';

import '../styles/vn.scss';

class VN extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interval: null
        }
    }

    render() {
        return(
            <React.Fragment>
                <Editor />

                <div className="control-panel">
                    <State />

                    <div className="control-buttons">
                        <div className="control-button" onClick={ () => this.props.compile() }>
                            <i className="fas fa-check" />
                            <br />
                            <span>Skompiluj</span>
                        </div>
                        <div className="control-button" onClick={ () => this.props.run() }>
                            <i className="fas fa-play" />
                            <br />
                            <span>Uruchom</span>
                        </div>
                        <div className="control-button" onClick={ () => this.props.step() }>
                            <i className="fas fa-terminal" />
                            <br />
                            <span>Wykonaj krok</span>
                        </div>
                        <div className="control-button">
                            <i className="fas fa-wrench" />
                            <br />
                            <span>Ustawienia</span>
                        </div>
                    </div>

                    <div className="accumulators">
                        <div className="accA">
                            <div className="label">@A</div>
                            <div className="value">
                                { this.props.accA }
                            </div>
                        </div>
                        <div className="accB">
                            <div className="label">@B</div>
                            <div className="value">
                                { this.props.accB }
                            </div>
                        </div>
                    </div>

                    <Log />
                </div>

                <Memory />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({ code: state.vn.code, accA: state.vn.acc["@A"], accB: state.vn.acc["@B"] });

const mapActionsToProps = {
    compile: compileAction,
    step: stepAction,
    run: runAction
}

export default connect(mapStateToProps, mapActionsToProps)(VN);