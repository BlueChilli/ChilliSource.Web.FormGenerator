import {createReducer} from "redux-immutablejs";
import {Map} from "immutable";

const initialState = Map({});

export default createReducer(initialState, {
  SET_FORM_SCHEMA_SUCCESS: (state, action) => {
    return state.set(action.meta.formName, action.payload);
  }
});