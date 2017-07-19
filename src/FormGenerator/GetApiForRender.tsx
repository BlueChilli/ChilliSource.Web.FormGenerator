import React from "react";
import {Map} from "immutable";

import {BaseReactProps} from "cs.core";
import {swaggerApiRequest} from "../../libs/fetchSchema"

interface Props extends BaseReactProps {
  children?: React.ReactElement<any>,
  api: swaggerApiRequest
}

interface State {
  response: Map<string, any>
}


export default class extends React.Component<Props, State>{
  constructor(props){
    super(props);
    this.state = {
      response: Map({})
    }
  }

  componentWillMount(){
    this.props.api().then(({data}) => {
      this.setState({
        response: data.get('data', Map())
      })
    })
  }

  render() {
    return React.cloneElement(this.props.children, {
      ...this.props,
      array: this.state.response
    })
  }
};