import React, { PropTypes, ComponentType, StatelessComponent } from "react";
import { Map, List, Iterable } from "immutable";
import { isUndefined } from "lodash";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { getData } from "./Actions/CrudHelpers";
import { getFirstPath, getTopStatePath } from "../../libs/stateHelpers";
import { createSpecificShallowEqual } from "cs.core";
import { BaseReactProps } from "cs.core";
import { omit } from "lodash";

const specificShallowEqual = createSpecificShallowEqual<{
  apiType: string;
  apiVerb?: string;
  stateName: string;
  params?: Map<string, any>;
  pathArgs?: Map<string, any>;
}>("apiType", "apiVerb", "stateName", "params", "pathArgs");

declare const window: any;

interface StateProps {
  data: Iterable<string | number, any>;
}

export interface CrudHelperInjectedProps extends StateProps, BaseReactProps {}

interface DispatchProps {
  getData: () => any;
}

interface OwnProps extends BaseReactProps {
  /** Capitalised: The key that the data will be added to state under,
     * should match the string provided to createCrudReducer */
  stateName: string;
  /** The group of api calls the wrapper interacts with */
  apiType: string;
  /** Api verb to fetch the data from, the default: 'Query' */
  apiVerb?: string;
  /** Params to be passed to the api request passed in the body of the request */
  params?: Map<string, any>;
  /** Path arguments to be passed to the api request injected into the path */
  pathArgs?: Map<string, any>;
}

type CrudHelperCreatedChild<T> = ComponentType<CrudHelperInjectedProps & T>;

export interface PassedDownCrudHelperWrapperProps extends OwnProps {}

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (
  state: Map<string, any>,
  { stateName, pathArgs = Map() }: OwnProps
) => {
  const statePath: string = getTopStatePath(stateName);
  const defaultDataPath: string[] = [
    statePath,
    getFirstPath(stateName),
    "data"
  ];
  const dataPath = pathArgs.has("id")
    ? defaultDataPath.concat(pathArgs.get("id") + "")
    : defaultDataPath;
  const data = state.getIn(dataPath, Map({})) || Map({});
  return {
    data
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch,
  {
    stateName,
    apiType,
    params,
    apiVerb = "Query",
    pathArgs = Map<string, string | number>()
  }: OwnProps
) => {
  return {
    getData: () => {
      getData(
        dispatch,
        stateName,
        window.client.getIn([apiType, `${apiType}_${apiVerb}`, "api"]),
        params,
        pathArgs
      );
    }
  };
};

// This class is infereing the wrong return so it explicitly stated
export function CrudHelperHOC<T extends {} = PassedDownCrudHelperWrapperProps>(
  WrapperComponent: CrudHelperCreatedChild<T>
) {
  class InnerCrudHelperWrapper extends React.Component<
    StateProps & DispatchProps & OwnProps & T,
    undefined
  > {
    componentWillMount() {
      this.props.getData();
    }
    componentWillReceiveProps(nextProps) {
      if (!specificShallowEqual(this.props, nextProps)) {
        nextProps.getData();
      }
    }
    render() {
      // TODO fix omit BS
      const props = omit<any, any>(
        this.props,
        "stateName",
        "apiType",
        "apiVerb",
        "params",
        "pathArgs"
      );
      return <WrapperComponent {...props} />;
      // return React.createElement<CrudHelperInjectedProps & T>(WrapperComponent, props);
    }
  }
  return connect<StateProps, DispatchProps, OwnProps & T>(
    mapStateToProps,
    mapDispatchToProps
  )(InnerCrudHelperWrapper);
}
