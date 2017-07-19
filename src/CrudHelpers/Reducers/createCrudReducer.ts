import {createReducer} from "redux-immutablejs";
import {Reducer, Action} from "redux";
import {OrderedMap, Map, List} from "immutable";
import {SetEditListItemAction, DeleteListItemAction} from "../Actions/List"
// import {ResolvedPromiseAction, StateNameAction} from "../../../libs/types"
import {DispatchedGetActionResolved} from "../Helpers/actionHelpers";

type State = Map<string, any>

interface ExtendObject {
  [key: string] : Reducer<State>
}

const initialEditState = Map({
  id: false,
  pathname: ''
});

const initialState = Map({
  editItem: initialEditState
});

const convertIdKeyedMap = (data = Map<string, Map<string, any>>({})) => {
  return data.map(value => {
    return List([value.get('id'), value]);
  });
};

const getPaginatedResolution = (state:State, action:DispatchedGetActionResolved) => {
  const {payload}:{payload: Map<string, any>} = action;
  const {stateName} = action.meta;
  return state.updateIn([stateName], OrderedMap(), (currentState:OrderedMap<string, any>) => {
    const mergedPageData:OrderedMap<string, any> = currentState.merge({
      currentPage: payload.get('currentPage'),
      pageCount: payload.get('pageCount')
    });
    const currentData:OrderedMap<string, any> = mergedPageData.get('data', OrderedMap({}));
    const updatedData:OrderedMap<string, any> = currentData.merge(convertIdKeyedMap(payload.get('data')));
    return mergedPageData.set('data', updatedData);
  });
};

const filterPaginatedResolution = (state:State, action:DispatchedGetActionResolved) => {
  const {payload} = action;
  const {stateName} = action.meta;
  const keyedPayload = payload.update('data', Map(), (data) => Map(convertIdKeyedMap(data)))
  return state.set(stateName, keyedPayload);
};


const getSingleResolution = (state:State, action:DispatchedGetActionResolved) => {
  const {payload} = action;
  const {stateName} = action.meta;
  return state.mergeIn([stateName, 'data'], Map({[payload.get('id')]: payload}));
};

const getResolution = (state:State, action:DispatchedGetActionResolved) => {
  const {payload} = action;
  const {stateName} = action.meta;
  return state.setIn([stateName, 'data'], payload);
};


export default (stateName:string, extend:ExtendObject = {}) => {
  return createReducer<State, any>(initialState, {
    [`FILTER_PAGINATED_${stateName}_SUCCESS`]: filterPaginatedResolution,

    [`GET_PAGINATED_${stateName}_SUCCESS`]: getPaginatedResolution,
    [`GET_SINGLE_${stateName}_SUCCESS`]: getSingleResolution,
    [`GET_${stateName}_SUCCESS`]: getResolution,

    [`GET_PAGINATED_${stateName}_FAILURE`]: getPaginatedResolution,
    [`GET_SINGLE_${stateName}_FAILURE`]: getSingleResolution,
    [`GET_${stateName}_FAILURE`]: getResolution,

    [`DELETE_${stateName}_SUCCESS`]: (state, action:DeleteListItemAction) => {
      const {payload} = action;
      const {stateName} = action.meta;
      return state.deleteIn([stateName, 'data', payload]);
    },
    [`POST_SINGLE_${stateName}_SUCCESS`]: (state, action) => {
      const {payload} = action;
      const {stateName} = action.meta;
      return state.setIn([stateName, 'data', payload.get('id')], payload);
    },
    [`POST_${stateName}_SUCCESS`]: (state, action) => {
      const {payload} = action;
      const {stateName} = action.meta;
      return state.setIn([stateName, 'data'], payload);
    },
    [`SET_${stateName}_EDIT_LIST_ITEM`]: (state, action:SetEditListItemAction) => {
      const {payload} = action;
      const {stateName} = action.meta;
      return state.set('editItem', Map({
        id: payload,
        stateName
      }));
    },
    [`RESET_${stateName}_EDIT_LIST_ITEM`]: state => {
      return state.set('editItem', initialEditState);
    },
    ...extend
  });
}
