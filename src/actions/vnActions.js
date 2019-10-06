export const CHANGE = "vn:change";
export const CHANGE_STATE = "vn:changeState";
export const COMPILE = "vn:compile";
export const SET_NAME = "vn:setName";
export const SET_ERROR = "vn:setError";
export const MEMORY_INIT = "vn:memoryInit";
export const SET_INSTRUCTIONS = "vn:setInstructions";
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

export const changeAction = code => (dispatch, getState) => {
    if( code.length && getState().vn.machineState !== "ready" ) 
        dispatch( changeStateAction("ready") );
    else if( code.length === 0 ) 
        dispatch( changeStateAction("waiting") );
    
    dispatch({ type: CHANGE, payload: code });
}

export const changeStateAction = newState => {
    return {
        type: CHANGE_STATE,
        payload: newState
    }
}

export const setError = errMsg => {
    return {
        type: SET_ERROR,
        payload: errMsg
    }
}

export const setName = code => {
    let name = code.match(/.UNIT,(\w+)/); // matches .UNIT,(name)
    
    if( !name || name.length !== 2 ) throw new Error("Brak deklaracji .UNIT lub błędna nazwa programu")
    return {
        type: SET_NAME,
        payload: name[1]
    }
}

export const memoryInit = code => {
    let [  , data ] = code.match(/\.DATA\n+([\w\n:.,#-]+)(?=\n.CODE)/) || []; // matches .DATA (block of variables)

    if( !data )
        throw new Error("Niepoprawny blok zmiennych .DATA lub brak sekcji .CODE");

    let lines = data.split("\n"); // splits every variable declaration

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
                if( val.indexOf("#") === -1 ) {
                    table.push({
                        name,
                        type: "tab",
                        value: isNaN(val) ? val : +val,
                        length: 0
                    });
                    address++;
                } else {
                    let [ , amount, repeatedVal ] = val.match(/(\d+)#(\d+)/) || [];

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
        } else {
            let val;

            if( isNaN(value) ) {
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

export const setInstructions = code => {
    let [ , ins ] = code.match(/\.CODE\n+([\w\n:.,#-@]+)(?=\n.END)/); // matches .CODE section
    
    if( !ins ) 
        throw new Error("Niepoprawna deklaracja bloku .CODE lub brak słowa kluczowego .END");

    let lines = ins.split("\n");

    let instructionSet = [];
    let labels = {};

    lines.forEach( (element, key) => {
        let [ , label, command, param1, param2 ] = element.match(/(\w+:)?(\w+),([\w@]+)?,?([\w()-]+)?,?/) || []; // matches (label):? (command), (param1)?, (param2)?
        console.log(command);
        if( !command ) 
            throw new Error("Wystąpił błąd");

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

export const compileAction = () => (dispatch, getState) => {
    try {
        let code = getState().vn.code.replace(/\t/g, "").replace(/ /g, "").replace(/\r\n/g, "\n").replace(/\n+/g, '\n');
        console.log(code);
        dispatch( setName(code) );

        dispatch( memoryInit(code) );

        dispatch( setInstructions(code) );

        dispatch({ type: COMPILE });
    } catch (e) {
        console.log(e);
        dispatch( setError(e.message) );
    }
}

// eslint-disable-next-line
String.prototype.countOcc = function(search) {
    let amount = 0;
    for( let i = 0; i < this.length; i++)
        if( this.charAt(i) === search ) 
            amount++;
    return amount;
}

let findAddress = (variable, addresses) => {
    let address = addresses[variable];
    if( typeof address === "undefined" )
        throw new Error("Nie znaleziono zmiennej " + variable);
    return address;
}

let findVariable = (variable, memory, addresses) => {
    let varName = variable.replace("(", "").replace(")", "");
    
    return memory[ findAddress(varName, addresses) ].value;
}

let getValue = (param, memory, addresses) => {
    switch( param.countOcc("(") ) {
        case 0:
            return findAddress(param, addresses) * 4;
        case 1:
            return findVariable(param, memory, addresses);
        case 2:
            let address = getValue(param.replace("(", "").replace(")", ""), memory, addresses);
            return memory[address/4].value
        default:
            throw new Error("Wystąpił nieokreślony błąd");
    }
}

export const changeAccContent = ( acc, value, type ) => (dispatch, getState) => {
    if( !(acc === "@A" || acc === "@B") )
        throw new Error("Błąd");
    
    if( !isNaN(value) ) {
        dispatch({ type, payload: { acc, value: +value } });
    } else {
        dispatch({ type, payload: {
            acc,
            value: getValue(value, getState().vn.memory, getState().vn.addresses)
        }})
    }
}

export const store = ( fAcc, value ) => ( dispatch, getState ) => {
    if( !(fAcc === "@A" || fAcc === "@B") || !isNaN(value) )
        throw new Error("Błąd");

    let { memory, addresses, acc } = getState().vn;
    let newMemory = [...memory];

    switch( value.countOcc("(") ) {
        case 0:
            newMemory[ findAddress(value, addresses) ].value = acc[fAcc];
            break;
        case 1:
            newMemory[ findVariable(value, memory, addresses) ] = acc[fAcc];
            break;
        default:
            throw new Error("Wystąpił nieokreślony błąd");
    }
    dispatch({ type: STORE, payload: newMemory });
}

export const stepAction = () => (dispatch, getState) => {
    let { programCounter, instructionSet, acc, lastAcc, labels } = getState().vn;

    let { command, param1, param2 } = instructionSet[programCounter];
    console.log(`${command}, ${param1}, ${param2}`);
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
        case 'store':
            dispatch( store(param1, param2) );
            break;
        case 'halt':
            break;
        default: 
            throw new Error("Nieznany rozkaz");
    }
}