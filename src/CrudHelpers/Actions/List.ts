import {Map} from "immutable";
import {splitPath, getTopStatePath, getFirstPath} from "../Helpers/stateHelpers";
import {PromiseAction, BaseAction, StateNameAction, swaggerApi} from "../../../types"


export interface SetEditListItem extends StateNameAction {
  payload: string|number
}

export const setEditListItem = (stateName:string, id:string|number) => {
  return {
    type: `SET_${stateName}_EDIT_LIST_ITEM`,
    payload: id,
    meta: {
      stateName: getFirstPath(stateName)
    }
  }
};

export interface ResetEditListItem extends BaseAction {}

export const resetEditListItem = (stateName:string) => {
  return {
    type: `RESET_${stateName}_EDIT_LIST_ITEM`
  }
};


export interface DeleteListItem extends StateNameAction, PromiseAction {}

export const deleteListItem = (stateName:string, id:string|number, api:swaggerApi) => {
  return {
    type: `DELETE_${stateName}`,
    payload: {
      promise: api(null, null, Map({id})).then(res => {
        return id;
      })
    },
    meta: {
      stateName: getFirstPath(stateName)
    }
  }
};

export const getNextPage = (stateName:string, pathname:string) => {
  return (dispatch, getState) => {
    const paginationDetails:Map<any, any> = getState().getIn([getTopStatePath(stateName), ...splitPath(pathname)], Map({}));
    const currentPage:number = paginationDetails.get('currentPage');
    const pageCount:number = paginationDetails.get('pageCount');
    if (currentPage < pageCount) {
      // dispatch(getList(stateName, pathname, currentPage + 1))
    }
  }
};
