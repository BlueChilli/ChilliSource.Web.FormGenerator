/** Libraries */
import { Map } from "immutable";
import { Dispatch } from "react-redux";

/** Helpers */
import { getFirstPath } from "../../libs/stateHelpers";
import { FSA } from "cs.core";
import { swaggerApiRequest } from "../../libs/fetchSchema";
import {
  dispatchPromiseAction,
  createPartialAction
} from "../../libs/reduxUtilities";
import { AxiosPromise } from "axios";

/**
 * Determines the type of action to be fired
 * @param data The response from the API that was executed
 * @param stateName The namespace under which the data exists e.g. Form for FormState
 */
const getPostActionType = (
  data: Map<string, any>,
  stateName: string
): string => {
  if (data.has("id")) {
    return `POST_SINGLE_${stateName}`;
  } else if (data.has("pageSize") || data.has("totalCount")) {
    return `FILTER_PAGINATED_${stateName}`;
  } else {
    return `POST_${stateName}`;
  }
};

/**
 * Generates the action to be fired
 * @param actionType The action type
 * @param stateName The namespace under which the data exists
 * @param promise ASK SHANE
 */
/**
 * Executes the API request and then fires the appropriate action
 * with an alert in case of an error
 * @param dispatch 
 * @param api 
 * @param data 
 * @param params 
 * @param pathArgs 
 */
export const dispatchPostAction = (
  dispatch: Dispatch<BaseAction>,
  api: swaggerApiRequest,
  data: Map<string, any>,
  params?: Map<string, any>,
  pathArgs?: Map<string, any>
) => (stateName: string): Promise<Map<string, any>> => {
  const action = createPartialAction(stateName, api(data, params, pathArgs));

  return dispatchPromiseAction(dispatch, action, getPostActionType);
};
