import {Map} from "immutable"
import {createDispatchGetAction} from "../../../libs/actionHelpers";
import {swaggerApiRequest} from "../../../libs/fetchSchema";

export const getData = (stateName:string, api:swaggerApiRequest, params:Map<string, any>, pathArgs:Map<string, any>) => {
  return dispatch => {
    createDispatchGetAction(dispatch, api, null, params, pathArgs)(stateName);
  }
};
