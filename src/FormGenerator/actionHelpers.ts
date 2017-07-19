/** Libraries */
import { Map } from 'immutable';
import { Dispatch } from 'react-redux';

/** Helpers */
import { getFirstPath } from '../CrudHelpers/Helpers/stateHelpers';
import { FSA } from 'cs.core';
import {swaggerApiRequest} from "../../libs/fetchSchema";


/**
 * Determines the type of action to be fired
 * @param data The response from the API that was executed
 * @param stateName The namespace under which the data exists e.g. Form for FormState
 */
const getPostActionType = (data, stateName: string): string => {
  if (data.has('id')) {
    return `POST_SINGLE_${stateName}`;
  } else if (data.has('pageSize') || data.has('totalCount')) {
    return `FILTER_PAGINATED_${stateName}`;
  } else {
    return `POST_${stateName}`;
  }
}

/**
 * Generates the action to be fired
 * @param actionType The action type
 * @param stateName The namespace under which the data exists
 * @param promise ASK SHANE
 */
const getPostAction = (actionType: string, stateName: string, promise: Promise<Map<string, any>>): FSA<{promise: Promise<Map<string, any>>}, string> => {
  return {
    type: actionType,
    payload: {
      promise,
    },
    meta: {
      stateName: getFirstPath(stateName)
    }
  }
}

/**
 * Executes the API request and then fires the appropriate action
 * with an alert in case of an error
 * @param dispatch 
 * @param api 
 * @param data 
 * @param params 
 * @param pathArgs 
 */
export const dispatchPostAction = (dispatch: Dispatch<BaseAction>, api: swaggerApiRequest, data: Map<string, any>, params?: Map<string, any>, pathArgs?: Map<string, any>) => (stateName: string): Promise<Map<string, any>> => {
  return api(data, params, pathArgs).then(({data}) => {
    const actionType = getPostActionType(data, stateName);
    dispatch(getPostAction(actionType, stateName, Promise.resolve(data)));
    return data;
  }).catch(err => {
    const actionType = getPostActionType(err.data, stateName);
    dispatch(getPostAction(actionType, stateName, Promise.reject(err.data)));
    return Promise.reject(err);
  })
};