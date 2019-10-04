import thunk from 'redux-thunk';
import reducer from './reducers/index';
import { applyMiddleware, compose, createStore } from 'redux';

let allStoreEnhancers = compose(
    applyMiddleware(thunk),
);

if(window.__REDUX_DEVTOOLS_EXTENSION__) {
    allStoreEnhancers = compose(
        applyMiddleware(thunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
}

export default createStore(
    reducer, 
    allStoreEnhancers
);