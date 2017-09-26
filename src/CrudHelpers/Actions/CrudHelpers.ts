import {Map} from "immutable"
import {createDispatchGetAction} from "../../../libs/actionHelpers";
import {swaggerApiRequest} from "../../../libs/fetchSchema";

export const getData = (dispatch, stateName:string, api:swaggerApiRequest, params:Map<string, any>, pathArgs:Map<string, any>) => {
  return createDispatchGetAction(dispatch, api, null, params, pathArgs)(stateName);
};
