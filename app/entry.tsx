import React from "react";
import ReactDOM from "react-dom";
import {FormGenerator, InputMapper} from "./"


class Base extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <FormGenerator stateName="SESSION" apiType="User" apiVerb="Login">
          <InputMapper name="email" />
          <InputMapper name="password" />
        </FormGenerator>
      </div>
    );
  }
}

const rootEl = document.getElementById("app");

ReactDOM.render(<Base />, rootEl);
