export const CHANGE = "vn:change";
export const CHANGE_STATE = "vn:changeState";
export const COMPILE = "vn:compile";
export const SET_NAME = "vn:setName";
export const SET_ERROR = "vn:setError";
export const MEMORY_INIT = "vn:memoryInit";


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

export const memoryInit = code => dispatch => {
    let data = code.match(/\.DATA\n+([\w\n:.,#-]+)(?=.CODE)/); // matches .DATA (block of variables)

    if( !data || data.length !== 2 ) 
        throw new Error("Niepoprawny blok zmiennych .DATA lub brak sekcji .CODE");

    let lines = data[1].match(/[\w:.,@()#-]+/g); // matches all lines with variables | splits every variable declaration to array
    if( !lines ) 
        throw new Error("Brak zmiennych");

    let memory = [
        {
            type: "var",
            value: 0,
            name: "zmienna"
        },
        {
            type: "tab",
            value: 56,
            name: "tablica"
        }
    ];

    
}

export const compileAction = () => (dispatch, getState) => {
    try {
        let code = getState().vn.code.replace(/\t/g, "").replace(/ /g, "").replace(/\r\n/g, "\n");
    
        dispatch( setName(code) );

        dispatch( memoryInit(code) );
    } catch (e) {
        dispatch( setError(e.message) );
    }
}