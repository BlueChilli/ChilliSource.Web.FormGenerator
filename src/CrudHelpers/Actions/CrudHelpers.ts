import { Map } from "immutable";
import { createDispatchGetAction } from "../../../libs/actionHelpers";
import { swaggerApiRequest } from "../../../libs/fetchSchema";
import { Dispatch } from "redux";

export const getData = (
  dispatch: Dispatch<{}>,
  stateName: string,
  api: swaggerApiRequest,
  params?: Map<string, any>,
  pathArgs?: Map<string, any>
) => {
  return createDispatchGetAction(dispatch, api, undefined, params, pathArgs)(
    stateName
  );
};
