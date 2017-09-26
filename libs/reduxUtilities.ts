import {getFirstPath} from "./stateHelpers"
import {AxiosPromise} from "axios";


export const createPartialAction = (stateName:string, promise:AxiosPromise) => {
  return {
    type: stateName,
    payload: {
      promise
    },
    meta: {
      stateName: getFirstPath(stateName)
    }
  };
};

export const dispatchPromiseAction = (dispatch, action, chooseTypeString, ...args) => {
  return action.payload.promise.then(({data}) => {
    dispatch({
      ...action,
      type: chooseTypeString(data, action.type) + "_SUCCESS",
      payload: data
    })
    return data
  }).catch(e => {
    dispatch({
      ...action,
      type: chooseTypeString(e.data, action.type) + "_FAILURE",
      payload: e.data,
      error: true
    })
    return Promise.reject(e)
  })
}
