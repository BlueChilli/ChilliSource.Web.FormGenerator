
import {getFirstPath} from "../Helpers/stateHelpers"
import {Iterable, Map} from "immutable";
import {Dispatch, Action} from "redux";
import {swaggerApiRequest} from "../../../libs/fetchSchema"

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


const createAction = (responseData:Map<string, any>, stateName:string, promise:Promise<Map<string, any>>) => {
  return {
    type: getActionType(responseData, stateName),
    payload: {
      promise
    },
    meta: {
      stateName: getFirstPath(stateName)
    }
  };
};

export const createDispatchGetAction = (dispatch:Dispatch<Action>, api:swaggerApiRequest, data:Map<string, any>, params:Map<string, any>, pathArgs:Map<string, any>) => (stateName:string):Promise<Map<string, any>> => {
  if(typeof api !== 'function'){
    throw new Error("That apiType does not exist in the current swagger schema");
  }
  return api(data, params, pathArgs).then(({data : responseData}) => {
    dispatch(createAction(responseData, stateName, Promise.resolve(responseData)));
    return responseData;
  }).catch(({data : errorData}) => {
    dispatch(createAction(errorData, stateName, Promise.reject(errorData)));
    return Promise.reject(errorData);
  })
};
