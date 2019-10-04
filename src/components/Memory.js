import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../styles/memory.scss'

class Memory extends Component {
    render() {
        return(
            <div className="memory">
                <div className="label">Pamięć</div>
                <table>
                    <thead>
                        <tr>
                            <th> Adres </th>
                            <th> Nazwa </th>
                            <th> Wartość </th>
                        </tr>
                    </thead>
                </table>
            </div>
        )
    }
}

const mapStateToProps = state => ({ code: state.vn.code });

export default connect(mapStateToProps, {})(Memory);