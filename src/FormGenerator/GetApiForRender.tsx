import React from "react";
import { Map } from "immutable";

import { BaseReactProps } from "cs.core";
import { swaggerApiRequest } from "../../libs/fetchSchema";

interface Props extends BaseReactProps {
  children?: React.ReactElement<{}>;
  api: swaggerApiRequest;
}

interface State {
  response: Map<string, any>;
}

export default class extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      response: Map({})
    };
  }

  componentWillMount() {
    this.props.api().then(({ data }: { data: Map<string, any> }) => {
      this.setState({
        response: data.get("data", Map())
      });
    });
  }

  render() {
    if (this.props.children && React.isValidElement(this.props.children)) {
      return React.cloneElement(this.props.children, {
        ...this.props,
        array: this.state.response
      });
    } else {
      return null;
    }
  }
}
