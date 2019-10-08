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
                    <tbody>
                        { this.props.memory.map( ({name, value, length }, key) => (
                            <tr key={ key }>
                                <td>{ key * 4 }</td>
                                { length > 0 && <td rowSpan={ length } className="name">{ name }</td>}
                                <td>{ value }</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

const mapStateToProps = state => ({ memory: state.vn.memory });

export default connect(mapStateToProps, {})(Memory);