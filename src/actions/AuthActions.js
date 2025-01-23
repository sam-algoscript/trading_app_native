import * as actions from './types';

export const setCurrentUser = (payload) => {
 return{
    type: actions.CURRENT_USER,
    payload:payload,
 }
}

export const setConnection = (payload) => {
   return{
      type:actions.SET_CONNECTION,
      payload:payload,
   }
}