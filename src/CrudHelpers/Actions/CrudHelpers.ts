import {createDispatchGetAction} from "../Helpers/actionHelpers";
import {swaggerApi, apiPathArgs} from "../../../types";

export const getData = (stateName:string, api:swaggerApi, params:Object, pathArgs:apiPathArgs) => {
  return dispatch => {
    createDispatchGetAction(dispatch, api, null, params, pathArgs)(stateName);
  }
};
