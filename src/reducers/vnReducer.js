import { CHANGE, CHANGE_STATE, COMPILE, SET_NAME, SET_ERROR, MEMORY_INIT } from '../actions/vnActions';


const inititialState = {
    code: "",
    machineState: "waiting",
    memory: [],
    instructions: [],
    name: "",
    error: ""
}

export default (state = inititialState, { type, payload }) => {
    switch(type) {
        case CHANGE:
            return {
                ...state,
                code: payload
            }
        case CHANGE_STATE:
            return {
                ...state,
                machineState: payload
            }
        case COMPILE:
            return {
                ...state,
                instructions: payload.instructions,
                machineState: payload.newState
            }
        case SET_NAME:
            return {
                ...state,
                name: payload
            }
        case SET_ERROR:
            return {
                ...state,
                error: payload,
                state: "error",
            }
        case MEMORY_INIT:
            return {
                ...state,
                memory: {
                    payload
                }
            }
        default:
            return state;
    }
};