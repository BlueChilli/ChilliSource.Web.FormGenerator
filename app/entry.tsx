import React from "react";
import ReactDOM from "react-dom";
import {
  FormGenerator,
  InputMapper,
  ListHelperHOC,
  ItemHelperHOC,
  ListHelperCreateChildrenProps,
  PassedDownCrudHelperWrapperProps
} from "./";
import { Provider } from "react-redux";
import { fromJS, Map } from "immutable";
import { combineReducers } from "redux-immutablejs";
import { createStore } from "redux";
import createCrudReducer from "../src/CrudHelpers/Reducers/createCrudReducer";
import fetchSchema from "../libs/fetchSchema";
import axios from "axios";
import { get } from "lodash";
import { Input } from "cs.forms";

const instance = axios.create({
  withCredentials: true,
  headers: {
    apiKey: "F5311DE2-6F54-443E-8FC6-863AE944CE4A"
  },
  transformResponse: data => {
    const parsedData = JSON.parse(data);
    return fromJS(parsedData);
  }
});

instance.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    console.log(error);
    const response = {
      ...error.response,
      data: get(error, ["response", "data"], Map()).set(
        "status",
        get(error, ["response", "status"], "")
      )
    };

    // console.log(props);
    return Promise.reject(response);
  }
);

declare const window: any;

const store = createStore(
  combineReducers({
    SessionState: createCrudReducer("SESSION")
  }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

class EmployeeListView extends React.Component<
  ListHelperCreateChildrenProps,
  {}
> {
  render() {
    return <div>{this.props.data.map(console.log)}</div>;
  }
}

const WrappedEmployeeListView = ListHelperHOC<PassedDownCrudHelperWrapperProps>(
  EmployeeListView
);

class UserItem extends React.Component<ListHelperCreateChildrenProps, {}> {
  render() {
    if (this.props.data.has("roles")) {
      return (
        <WrappedEmployeeListView
          apiType="Company"
          apiVerb="Add"
          stateName="Employee"
          params={Map({
            "filter.includes": "availability",
            "filter.includeAvailability.minDate": "2000-01-01",
            "filter.includeAvailability.maxDate": "2100-01-01"
          })}
        />
      );
    }
    return <div />;
  }
}

const WrappedUserItem = ItemHelperHOC<PassedDownCrudHelperWrapperProps>(
  UserItem
);

class Base extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <FormGenerator stateName="SESSION" apiType="User" apiVerb="Login">
          <InputMapper name="email" component={<Input name="email" />} />
          <InputMapper name="password" />
          <button>Login</button>
        </FormGenerator>
        <WrappedUserItem apiType="User" apiVerb="Profile" stateName="SESSION" />
      </div>
    );
  }
}

const rootEl = document.getElementById("app");

fetchSchema(instance, "https://benchon-dev.azurewebsites.net", schema => {
  window.client = schema;
  ReactDOM.render(
    <Provider store={store}>
      <Base />
    </Provider>,
    rootEl
  );
});
