export const CHANGE = "vn:change";
export const CHANGE_STATE = "vn:changeState";
export const SET_NAME = "vn:setName";
export const SET_ERROR = "vn:setError";

export const MEMORY_INIT = "vn:memoryInit";
export const SET_INSTRUCTIONS = "vn:setInstructions";
export const COMPILE = "vn:compile";

export const LOAD = "vn:load";
export const ADD = "vn:add";
export const SUB = "vn:sub";
export const MULT = "vn:mult";
export const DIV = "vn:div";
export const JUMP = "vn:jump";
export const JPOS = "vn:jpos";
export const JNEG = "vn:jneg";
export const JZERO = "vn:jzero";
export const STORE = "vn:store";
export const NEXT = "vn:next";
export const HALT = "vn:halt";

export const RUN = "vn:run";
export const LOG = "vn:log";
export const CLEAR_LOG = "vn:clearLog";

/**
 * Action handles code editor
 * @param {string} code input from user
 */
export const changeAction = code => (dispatch, getState) => {
    if( code.length && getState().vn.machineState !== "ready" ) 
        dispatch( changeState("ready") );
    else if( code.length === 0 ) 
        dispatch( changeState("waiting") );
    
    dispatch({ type: CHANGE, payload: code });
}

/**
 * Action changes machineState property
 * @param {string} newState 
 */
const changeState = newState => {
    return {
        type: CHANGE_STATE,
        payload: newState
    }
}

/**
 * Sets error, changes machineState to 'error'
 * @param {string} errMsg Error message
 */
const setError = errMsg => {
    return {
        type: SET_ERROR,
        payload: errMsg
    }
}

/**
 * Sets name property, throws error if there is mistake in .UNIT part
 * @param {string} code Code of the program without tabs and spaces
 */
const setName = name => {
    return {
        type: SET_NAME,
        payload: name
    }
}

/**
 * Initializes memory based on .DATA part
 * @param {string} code code of the program without tabs and spaces
 */
const memoryInit = code => {
    let lines = code.split("\n"); // splits every variable declaration
    
    let memory = [];
    let address = 0;
    let addresses = {};

    lines.forEach( (element, key) => {
        let [ , name, value ] = element.match(/(\w+):.WORD,([\w,#-]+)/) || []; // matches (name_of_variable): .WORD,(value)

        if( !name || !value ) 
            throw new Error("Niepoprawna deklaracja zmiennej w linii: " + (key + 1));

        addresses[name] = address++;

        if( /[#,]/.test(value) ) { // when variable is array
            let tabEntries = value.split(",");

            let table = [];

            tabEntries.forEach( val => {
                if( val.indexOf("#") === -1 ) { // when table element is single value
                    table.push({
                        name,
                        type: "tab",
                        value: isNaN(val) ? val : +val,
                        length: 0
                    });
                    address++;
                } else {
                    let [ , amount, repeatedVal ] = val.match(/(\d+)#(\d+)/) || []; // matches amount#repeated value ex. 4#2

                    if( !repeatedVal || !amount || isNaN(amount) ) 
                        throw new Error("Niepoprawna deklaracja zmiennej w linii: " + (key + 1));

                    for(let i = 0; i < amount; i++) {
                        table.push({
                            name,
                            type: "tab",
                            value: isNaN(repeatedVal) ? repeatedVal : +repeatedVal,
                            length: 0
                        });
                    }

                    address += +amount;
                }
            });

            table[0]["length"] = table.length;
            memory = [ ...memory, ...table ];
            address--;
        } else { // when variable is not tab
            let val;

            if( isNaN(value) ) { // checks if variable is a pointer to tab
                if( typeof addresses[value] === "undefined" ) 
                    throw new Error("Niepoprawna deklaracja zmiennej w linii: " + (key + 1));
                else
                    val = addresses[value] * 4;
            } else
                val = +value;

            memory.push({
                name,
                type: "var",
                value: val,
                length: 1
            });
        }
    });
    
    return {
        type: MEMORY_INIT,
        payload: { memory, addresses }
    }
}

/**
 * Makes array of objects containing single command with its paramaters
 * @param {string} code code of the program without tabs and spaces
 */
const setInstructions = code => {
    let lines = code.split("\n");

    let instructionSet = [];
    let labels = {};

    lines.forEach( (element, key) => {
        let [ , label, command, param1, param2 ] = element.match(/(\w+:)?(\w+),([\w@]+)?,?([\w()-]+)?,?/) || []; // matches (label):? (command), (param1)?, (param2)?

        if( !command ) 
            throw new Error("Wystąpił błąd w lini " + key);

        if( typeof label !== "undefined" ) 
            labels[ label.substring(0, label.length - 1) ] = key;

        instructionSet.push({
            command,
            param1,
            param2
        });
    });

    return {
        type: SET_INSTRUCTIONS,
        payload: { instructionSet, labels }
    }
}

/**
 * Checks code if is valid, then sets name, initializes memory makes instruction list
 */
export const compileAction = () => (dispatch, getState) => {
    try {
        let co = getState().vn.code;
        let [ illegalCharacter ] = co.match(/[^ \n\r\n\t.:A-Za-z,0-9_@()]#/) || [];
        if( illegalCharacter ) {
            throw new Error(`Niedozwolony znak: ${illegalCharacter} - linia ${co.countOcc("\n", illegalCharacter) + 1}`);
        }
            
        let cod = co.replace(/\t/g, "").replace(/ /g, "").replace(/\r\n/g, "\n").replace(/\n+/g, '\n');
        
        let [ , name, data, code ] = cod.match(/\.UNIT,(\w+)\n\.DATA\n+([\w\n:.,#-]+)\n.CODE\n+([\w\n:.,#-@]+)\n.END/) || [];
        
        if( !name || !data || !code ) 
            throw new Error("Niedozwolone znaki lub brak słów kluczowych");

        dispatch( setName(name) );

        dispatch( memoryInit(data) );

        dispatch( setInstructions(code) );

        dispatch({ type: COMPILE });
        
    } catch (e) {
        console.log(e);
        dispatch( setError(e.message) );
    }
}

// eslint-disable-next-line
String.prototype.countOcc = function(search, stop) {
    let amount = 0;
    for( let i = 0; i < this.length; i++){
        if( this.charAt(i) === stop )
            break;
        if( this.charAt(i) === search ) 
            amount++;
    }
        
    return amount;
}

/**
 * Finds memory address of variable
 * @param {string} variable name of the variable
 * @param {array} addresses object contains pairs var_name->var_address
 */
const findAddress = (variable, addresses) => {
    let address = addresses[variable];
    if( typeof address === "undefined" )
        throw new Error("Nie znaleziono zmiennej " + variable);
    return address;
}

/**
 * Finds value of (var)
 * @param {string} variable name of the (variable)
 * @param {array} memory machine's memory
 * @param {array} addresses object contains pairs var_name->var_address
 */
const findVariableValue = (variable, memory, addresses) => {
    let varName = variable.replace("(", "").replace(")", "");
    
    return memory[ findAddress(varName, addresses) ].value;
}

/**
 * Gets value from parameter
 * @param {string} param parameter
 * @param {array} memory machine's memory
 * @param {array} addresses object contains pairs var_name->var_address
 */
const getValue = (param, memory, addresses) => {
    switch( param.countOcc("(") ) {
        case 0:
            return findAddress(param, addresses) * 4;
        case 1:
            return findVariableValue(param, memory, addresses);
        case 2:
            let address = getValue(param.replace("(", "").replace(")", ""), memory, addresses);
            return memory[address/4].value
        default:
            throw new Error("Wystąpił nieokreślony błąd");
    }
}

/**
 * Changes accumulator content based on type
 * @param {string} acc name of accumulator
 * @param {int} value value 
 * @param {string} type LOAD, ADD, SUB etc
 */
const changeAccContent = ( acc, value, type ) => (dispatch, getState) => {
    if( !(acc === "@A" || acc === "@B") )
        throw new Error("");
    
    if( !isNaN(value) ) {
        dispatch({ type, payload: { acc, value: +value } });
    } else {
        dispatch({ type, payload: {
            acc,
            value: getValue(value, getState().vn.memory, getState().vn.addresses)
        }})
    }
}

/**
 * Saves value from accumulator to memory
 * @param {string} fAcc from wchich accumulator
 * @param {int} value where to store
 */
const store = ( fAcc, value ) => ( dispatch, getState ) => {
    if( !(fAcc === "@A" || fAcc === "@B") || !isNaN(value) )
        throw new Error("");

    let { memory, addresses, acc } = getState().vn;
    let newMemory = [...memory];

    switch( value.countOcc("(") ) {
        case 0:
            newMemory[ findAddress(value, addresses) ].value = acc[fAcc];
            break;
        case 1:
            newMemory[ findVariableValue(value, memory, addresses) / 4 ].value = acc[fAcc];
            break;
        default:
            throw new Error("Wystąpił nieokreślony błąd");
    }
    dispatch({ type: STORE, payload: newMemory });
}

/**
 * Run one command based on programCounter
 */
const execute = () => ( dispatch, getState ) => {
    try {
        let { programCounter, instructionSet, acc, lastAcc, labels, machineState } = getState().vn;
    
        let { command, param1, param2 } = instructionSet[programCounter];
        console.log(`${command}, ${param1}, ${param2}`);
    
        if( !(machineState === "runing" || machineState === "compiled") )
            return;
    
        switch( command ) {
            case 'load':
                dispatch( changeAccContent(param1, param2, LOAD) );
                break;
            case 'add':
                dispatch( changeAccContent(param1, param2, ADD) );
                break;
            case 'sub':
                dispatch( changeAccContent(param1, param2, SUB) );
                break;
            case 'mult':
                dispatch( changeAccContent(param1, param2, MULT) );
                break;
            case 'div':
                dispatch( changeAccContent(param1, param2, DIV) );
                break;
            case 'jump':
                dispatch({ type: JUMP, payload: labels[param1] });
                break;
            case 'jneg':
                if( acc[lastAcc] < 0 ) 
                    dispatch({ type: JUMP, payload: labels[param1] });
                else 
                    dispatch({ type: NEXT });
                break;
            case 'jpos':
                if( acc[lastAcc] > 0 ) 
                    dispatch({ type: JUMP, payload: labels[param1] });
                else 
                    dispatch({ type: NEXT });
                break;
            case 'jzero':
                if( acc[lastAcc] === 0 ) 
                    dispatch({ type: JUMP, payload: labels[param1] });
                else 
                    dispatch({ type: NEXT });
                break;
            case 'jnzero':
                if( acc[lastAcc] !== 0 ) 
                    dispatch({ type: JUMP, payload: labels[param1] });
                else 
                    dispatch({ type: NEXT });
                break;
            case 'store':
                dispatch( store(param1, param2) );
                break;
            case 'halt':
                dispatch({ type: HALT });
                break;
            default: 
                throw new Error("Nieznany rozkaz: " + command);
        }
        
    } catch(e) {
        dispatch( setError(e.message) );
    }
} 

/**
 * 
 */
export const stepAction = () => (dispatch, getState) => {
    if( getState().vn.machineState === "compiled" )
        dispatch( execute() );
    else
        dispatch({
            type: LOG,
            payload: {
                type: "warning",
                text: "Najpierw skompiluj program"
            }
        })
}

/**
 * 
 */
export const runAction = () => (dispatch, getState) => {
    if( getState().vn.machineState === "compiled" )
        dispatch({
            type: RUN,
            payload: setInterval( () => { dispatch( execute() ) }, getState().vn.clock)
        });
    else
        dispatch({
            type: LOG,
            payload: {
                type: "warning",
                text: "Najpierw skompiluj program"
            }
        })
}

export const clearLogAction = () => {
    return {
        type: CLEAR_LOG
    }
}
