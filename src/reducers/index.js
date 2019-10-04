import vnReducer from './vnReducer';

import { combineReducers } from 'redux';

export default combineReducers({
    vn: vnReducer,
});