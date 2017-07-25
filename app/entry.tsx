import React from "react";
import ReactDOM from "react-dom";
import {FormGenerator, InputMapper} from "./"
import {Provider} from "react-redux";
import {fromJS} from "immutable"
import {combineReducers} from 'redux-immutablejs';
import {createStore} from "redux";
import createCrudReducer from "../src/CrudHelpers/Reducers/createCrudReducer";
import fetchSchema from "../libs/fetchSchema";
import axios from "axios";
import {Input} from "cs.forms"


const instance = axios.create({
  withCredentials: true,
  headers: {
    apiKey: "F5311DE2-6F54-443E-8FC6-863AE944CE4A"
  },
  transformResponse: (data) => {
    const parsedData = JSON.parse(data);
    return fromJS(parsedData);
  }
});

instance.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function ({response}) {
  // Do something with response error
  response.data = response.data.set('status', response.status);

  return Promise.reject(response);
});


declare const window : any

const store = createStore(combineReducers({
  SessionState: createCrudReducer("SESSION")
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


class Base extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <FormGenerator stateName="SESSION" apiType="User" apiVerb="Login">
          <InputMapper name="email" component={<Input name="email"/>}/>
          <InputMapper name="password" />
          <button>Login</button>
        </FormGenerator>
      </div>
    );
  }
}

const rootEl = document.getElementById("app");

fetchSchema(instance, "https://benchon-dev.azurewebsites.net", (schema) => {
  window.client = schema;
  ReactDOM.render((
    <Provider store={store}>
      <Base />
    </Provider>
  ), rootEl);
})

