import { combineReducers } from 'redux'
import AuthReducer from './AuthReducer'
import ClientReducer from './ClientReducer'

const rootReducer = combineReducers({
    auth: AuthReducer,
    user:ClientReducer
})

export default rootReducer