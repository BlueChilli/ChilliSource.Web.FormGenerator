
import {Iterable, Map} from "immutable";
import {Dispatch, Action} from "redux";
import {swaggerApiRequest} from "../libs/fetchSchema";
import {dispatchPromiseAction, createPartialAction} from "../libs/reduxUtilities";

interface DispatchedGetAction extends Action {
  type: string;
  payload: {
      promise: Promise<Map<string, any>>;
  };
  meta: {
      stateName: string;
  };
}

export interface DispatchedGetActionResolved extends Action {
  type: string;
  payload: Map<string, any>
  meta: {
      stateName: string;
  };
}

export const getActionType = (data:Map<string, any>, stateName:string) => {
  if(Iterable.isIterable(data)){
    if (data.has('data')) {
      return `GET_PAGINATED_${stateName}`
    } else if (data.has('id')) {
      return `GET_SINGLE_${stateName}`;
    } 
  }
  return `GET_${stateName}`;
};

export const createDispatchGetAction = (dispatch:Dispatch<Action>, api:swaggerApiRequest, data:Map<string, any>, params:Map<string, any>, pathArgs:Map<string, any>) => (stateName:string):Promise<Map<string, any>> => {
  if(typeof api !== 'function'){
    throw new Error("That apiType does not exist in the current swagger schema");
  }
  const action = createPartialAction(stateName, api(data, params, pathArgs));

  return dispatchPromiseAction(dispatch, action, getActionType)
};
