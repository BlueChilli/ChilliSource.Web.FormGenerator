import { getFirstPath } from "./stateHelpers";
import { AxiosPromise } from "axios";
import { Dispatch, Action } from "redux";
import { Map } from "immutable";

export const createPartialAction = (
  stateName: string,
  promise: AxiosPromise
) => {
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

interface PromiseAction extends Action {
  payload: { promise: Promise<any> };
}

export const dispatchPromiseAction = (
  dispatch: Dispatch<{}>,
  action: PromiseAction,
  chooseTypeString: (data: Map<string, any>, type: string) => string
) => {
  return action.payload.promise
    .then(({ data }) => {
      dispatch({
        ...action,
        type: chooseTypeString(data, action.type) + "_SUCCESS",
        payload: data
      });
      return data;
    })
    .catch(e => {
      dispatch({
        ...action,
        type: chooseTypeString(e.data, action.type) + "_FAILURE",
        payload: e.data,
        error: true
      });
      return Promise.reject(e);
    });
};
