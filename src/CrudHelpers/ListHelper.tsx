import React, { PropTypes, ComponentClass, StatelessComponent } from "react";
import { List } from "immutable";
import { connect, MapStateToProps, MapDispatchToProps } from "react-redux";
import {
  setEditListItem,
  deleteListItem,
  getNextPage,
  resetEditListItem
} from "./Actions/List";
import {
  CrudHelperHOC,
  PassedDownCrudHelperWrapperProps,
  CrudHelperInjectedProps
} from "./CrudHelperWrapper";
import { BaseReactProps } from "cs.core";
import { omit } from "lodash";

interface DispatchProps {
  /** {Passed Down} a function to retrieve the next page in a paginated array */
  getNextPage: () => void;
  /** {Passed Down} a function to delete an item in the dataset
     * @param: {string, number} the id of the list item to delete, available in the data prop */
  deleteListItem: (id: string | number) => void;
  /** {Passed Down} a function to trigger and edit on and attached form generator for an item in the dataset
     * @param: {string, number} the id of the list item to edit, available in the data prop */
  editListItem: (id: string | number) => void;
  /** {Passed Down} */
  // nextDisplayed: boolean
  resetEditState: () => void;
}

interface OwnProps extends PassedDownCrudHelperWrapperProps {}
interface ListHelperProps
  extends DispatchProps,
    OwnProps,
    CrudHelperInjectedProps {}

export interface ListHelperCreateChildrenProps
  extends DispatchProps,
    OwnProps,
    CrudHelperInjectedProps {}

type ListHelperCreatedChild<T> = ComponentClass<
  ListHelperCreateChildrenProps & T
>;

const mapStateToProps: MapStateToProps<{}, OwnProps> = (
  state,
  { apiType, stateName }: OwnProps
) => {
  return {
    // isEdit:
    // nextDisplayed: state.getIn([statePath, ...path, 'currentPage']) !== state.getIn([statePath, ...path, 'pageCount']) && data.size > 0
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch,
  { stateName, apiType }
) => {
  const deleteApi = window.client.getIn([apiType, `${apiType}_Delete`, "api"]);
  return {
    editListItem: id => dispatch(setEditListItem(stateName, id)),
    deleteListItem: id => dispatch(deleteListItem(stateName, id, deleteApi)),
    getNextPage: () => dispatch(getNextPage(stateName, apiType)),
    resetEditState: () => dispatch(resetEditListItem(stateName))
  };
};

export { resetEditListItem };

// This class is infereing the wrong return so it explicitly stated
/** A component to display, edit and delete a list of paginated elements */
export function ListHelperHOC<T>(
  ListComponent: ListHelperCreatedChild<T>
): React.ComponentClass<OwnProps & T> {
  const CrudHelperWrapper = CrudHelperHOC<ListHelperCreateChildrenProps & T>(
    ListComponent
  );

  class InnerListHelper extends React.Component<ListHelperProps & T, {}> {
    componentWillUnmount() {
      this.props.resetEditState();
    }
    render() {
      return <CrudHelperWrapper {...this.props as any} />;
    }
  }
  return connect<{}, DispatchProps, OwnProps & T>(
    undefined,
    mapDispatchToProps
  )(InnerListHelper);
}
