import React, { Component } from 'react';
import { connect } from 'react-redux';

import Memory from './Memory';
import Editor from './Editor';
import State from './State';

import { compileAction } from '../actions/vnActions';

import '../styles/vn.scss';

class VN extends Component {
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
                        <div className="control-button">
                            <i className="fas fa-play" />
                            <br />
                            <span>Uruchom</span>
                        </div>
                        <div className="control-button">
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
                                0
                            </div>
                        </div>
                        <div className="accB">
                            <div className="label">@B</div>
                            <div className="value">
                                0
                            </div>
                        </div>
                    </div>
                </div>

                <Memory />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({ code: state.vn.code });

const mapActionsToProps = {
    compile: compileAction
}

export default connect(mapStateToProps, mapActionsToProps)(VN);