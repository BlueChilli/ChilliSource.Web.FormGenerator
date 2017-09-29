import { Map } from "immutable";
import {
  splitPath,
  getTopStatePath,
  getFirstPath
} from "../../../libs/stateHelpers";
import { swaggerApiRequest } from "../../../libs/fetchSchema";
import { FSA } from "cs.core";
import { ThunkAction } from "redux-thunk";

export interface SetEditListItemAction extends FSA<string | number, string> {}

export const setEditListItem = (
  stateName: string,
  id: string | number
): SetEditListItemAction => {
  return {
    type: `SET_${stateName}_EDIT_LIST_ITEM`,
    payload: id,
    meta: {
      stateName: getFirstPath(stateName)
    }
  };
};

export interface ResetEditListItemAction extends FSA<undefined, string> {}

export const resetEditListItem = (
  stateName: string
): ResetEditListItemAction => {
  return {
    type: `RESET_${stateName}_EDIT_LIST_ITEM`
  };
};

export interface DeleteListItemAction
  extends FSA<{ promise: Promise<string | number> }, string> {}

export const deleteListItem = (
  stateName: string,
  id: string | number,
  api: swaggerApiRequest
): DeleteListItemAction => {
  return {
    type: `DELETE_${stateName}`,
    payload: {
      promise: api(undefined, undefined, Map({ id })).then(res => {
        return id;
      })
    },
    meta: {
      stateName: getFirstPath(stateName)
    }
  };
};

export const getNextPage = (
  stateName: string,
  pathname: string
): ThunkAction<void, Map<string, any>, undefined> => (dispatch, getState) => {
  const paginationDetails: Map<any, any> = getState().getIn(
    [getTopStatePath(stateName), ...splitPath(pathname)],
    Map({})
  );
  const currentPage: number = paginationDetails.get("currentPage");
  const pageCount: number = paginationDetails.get("pageCount");
  if (currentPage < pageCount) {
    // dispatch(getList(stateName, pathname, currentPage + 1))
  }
};
