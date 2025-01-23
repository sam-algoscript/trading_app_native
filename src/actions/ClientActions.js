import * as actions from './types';

export const setClientWatchListData = (payload) => {
 return{
    type: actions.CLIENT_WATCHLIST_DATA,
    payload:payload,
 }
}