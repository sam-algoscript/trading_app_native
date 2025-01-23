import * as actions from '../actions/types';

const initialState = {
   user:{}, 
   connection:false,
}

export default function (state = initialState, action) {
    switch(action.type){
        case actions.CURRENT_USER:
            return{
                ...state,
                user:action.payload
            }
        case actions.SET_CONNECTION:
            return{
                ...state,
                connection:action.payload
            }
        default:
            return state;
    }

}
