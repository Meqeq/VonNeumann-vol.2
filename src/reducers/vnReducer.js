import { CHANGE, CHANGE_STATE, COMPILE, SET_NAME, SET_ERROR, MEMORY_INIT, SET_INSTRUCTIONS, LOAD, ADD, SUB, MULT, DIV, JUMP, STORE, NEXT, RUN, HALT, LOG, CLEAR_LOG } from '../actions/vnActions';


const inititialState = {
    code: "",
    machineState: "waiting",
    memory: [],
    addresses: {},
    instructionSet: [],
    labels: {},
    name: "",
    error: "",
    programCounter: 0,
    lastAcc: "@A",
    acc: {
        "@A": 0,
        "@B": 0
    },
    interval: null,
    clock: 1,
    logs: [],
    offset: 3
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
                machineState: "compiled",
                programCounter: 0,
                logs: [
                    ...state.logs,
                    { type: "info", text: "Skompilowano program: " + state.name }
                ]
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
                machineState: "error",
                interval: clearInterval( state.interval ),
                logs: [
                    ...state.logs,
                    { type: "error", text: "Wystąpił błąd: " + payload }
                ]
            }
        case MEMORY_INIT:
            return {
                ...state,
                memory: payload.memory,
                addresses: payload.addresses,
                offset: payload.offset + 3
            }
        case SET_INSTRUCTIONS:
            return {
                ...state,
                instructionSet: payload.instructionSet,
                labels: payload.labels
            }
        case LOAD:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Załadowano ${payload.value} do ${payload.acc}` }
                ]
            }
        case ADD:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] + payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Dodano ${payload.value} do ${payload.acc}` }
                ]
            }
        case SUB:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] - payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Odjęto ${payload.value} od ${payload.acc}` }
                ]
            }
        case MULT:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] * payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Domnożono ${payload.value} do ${payload.acc}` }
                ]
            }
        case DIV:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: Math.floor(state.acc[payload.acc] / payload.value) },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Podzielono przez ${payload.value} z ${payload.acc}` }
                ]
            }
        case JUMP:
            return {
                ...state,
                programCounter: payload,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Skok do ${payload}` }
                ]
            }
        case NEXT:
            return {
                ...state,
                programCounter: state.programCounter + 1,
            }
        case STORE:
            return {
                ...state,
                memory: payload,
                programCounter: state.programCounter + 1,
                logs: [
                    ...state.logs,
                    { type: "exe", text: `Zapisano zawartość ${state.lastAcc}` }
                ]
            }
        case RUN:
            return {
                ...state,
                interval: payload,
                machineState: "runing",
                logs: [
                    ...state.logs,
                    { type: "info", text: "Uruchomiono program" }
                ]
            }
        case HALT:
            return {
                ...state,
                interval: clearInterval( state.interval ),
                machineState: "end",
                logs: [
                    ...state.logs,
                    { type: "info", text: "Zakończono program" }
                ]
            }
        case LOG:
            return {
                ...state,
                logs: [...state.logs, { type: payload.type, text: payload.text }]
            }
        case CLEAR_LOG:
            return {
                ...state,
                logs: []
            }
        default:
            return state;
    }
};