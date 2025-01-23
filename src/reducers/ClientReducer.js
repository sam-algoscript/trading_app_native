import * as actions from '../actions/types';

const initialState = {
   clientWatchListData:{}, 
}
export default function(state = initialState, action)  {
    switch(action.type){
        case actions.CLIENT_WATCHLIST_DATA:
            return{
                ...state,
                clientWatchListData:action.payload
            }
        default:
            return state;
    }

};
