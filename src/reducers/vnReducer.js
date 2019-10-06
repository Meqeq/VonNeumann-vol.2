import { CHANGE, CHANGE_STATE, COMPILE, SET_NAME, SET_ERROR, MEMORY_INIT, SET_INSTRUCTIONS, LOAD, ADD, SUB, MULT, DIV, JUMP, STORE, NEXT } from '../actions/vnActions';


const inititialState = {
    code: `.UNIT, minimum
    .DATA
        t: .WORD, 23,34,34,23,5,46,45,2,70,11
        n: .WORD, 10
        adr: .WORD, t
        min: .WORD, 0
    .CODE
        load, @B, (n)
        load, @A, ((adr))
        store, @A, min
    et2:sub,@B,1
        jzero, et1
        load, @A, (adr)
        add, @A, 4
        store, @A, adr
        load, @A, ((adr))
        sub, @A, (min)
        jpos, et2
        jzero, et2
        add, @A, (min)
        store, @A, min
        jump, et2
    et1:halt,
    .END`,
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
    }
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
                programCounter: 0
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
                memory: payload.memory,
                addresses: payload.addresses
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
                programCounter: state.programCounter + 1
            }
        case ADD:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] + payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1
            }
        case SUB:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] - payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1
            }
        case MULT:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: state.acc[payload.acc] * payload.value },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1
            }
        case DIV:
            return {
                ...state,
                acc: { ...state.acc, [payload.acc]: Math.floor(state.acc[payload.acc] / payload.value) },
                lastAcc: payload.acc,
                programCounter: state.programCounter + 1
            }
        case JUMP:
            return {
                ...state,
                programCounter: payload
            }
        case NEXT:
            return {
                ...state,
                programCounter: state.programCounter + 1
            }
        case STORE:
            return {
                ...state,
                memory: payload,
                programCounter: state.programCounter + 1
            }
        default:
            return state;
    }
};