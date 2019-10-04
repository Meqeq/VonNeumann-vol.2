import React, { Component } from 'react';
import { connect } from 'react-redux';
import ME from 'react-monaco-editor';

import { changeAction } from '../actions/vnActions';

import '../styles/editor.scss';

class Editor extends Component {
    render() {
        return(
            <div className="editor">
                <div className="label">Kod</div>
                <div className="monaco-editor">
                    <ME 
                        theme="vs-dark"
                        options={{ 
                            minimap: {enabled: false},
                            lineNumbersMinChars: 3,
                            lineDecorationsWidth: 0,
                            scrollbar: { verticalScrollbarSize: 0 }
                        }}
                        value={ this.props.code }
                        onChange={ value => this.props.change(value) }
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ code: state.vn.code });

const mapActionsToProps = {
    change: changeAction
}

export default connect(mapStateToProps, mapActionsToProps)(Editor);