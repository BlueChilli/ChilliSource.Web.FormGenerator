import React, {PropTypes, ComponentClass, StatelessComponent} from "react";
import {List} from "immutable";
import {connect} from "react-redux";
import {setEditListItem, deleteListItem, getNextPage, resetEditListItem} from "./Actions/List"
import {CrudHelperHOC, PassedDownCrudHelperWrapperProps, CrudHelperInjectedProps} from "./CrudHelperWrapper"
import {BaseReactProps, ShallowCompare} from "../../libs/types"
import {omit} from "lodash";

declare var window;

interface DispatchProps{
   /** {Passed Down} a function to retrieve the next page in a paginated array */
    getNextPage: () => undefined,
    /** {Passed Down} a function to delete an item in the dataset
     * @param: {string, number} the id of the list item to delete, available in the data prop */
    deleteListItem: (id: string | number) => undefined,
    /** {Passed Down} a function to trigger and edit on and attached form generator for an item in the dataset
     * @param: {string, number} the id of the list item to edit, available in the data prop */
    editListItem: (id: string | number) => undefined,
    /** {Passed Down} */
    // nextDisplayed: boolean
    resetEditState: () => undefined
}


interface OwnProps extends PassedDownCrudHelperWrapperProps {}
interface ListHelperProps extends DispatchProps, OwnProps, CrudHelperInjectedProps {}

export interface ListHelperCreateChildrenProps extends DispatchProps, OwnProps, CrudHelperInjectedProps {}

type ListHelperCreatedChild<T> = ComponentClass<ListHelperCreateChildrenProps & T>



const mapStateToProps = (state, {apiType, stateName}:OwnProps) => {
  return {
    // isEdit:
    // nextDisplayed: state.getIn([statePath, ...path, 'currentPage']) !== state.getIn([statePath, ...path, 'pageCount']) && data.size > 0
  };
};

const mapDispatchToProps = (dispatch, {stateName, apiType}:OwnProps):DispatchProps => {
  const deleteApi = window.client.getIn([apiType, `${apiType}_Delete`, 'api']);
  return {
    editListItem: (id) => dispatch(setEditListItem(stateName, id)),
    deleteListItem: (id) => dispatch(deleteListItem(stateName, id, deleteApi)),
    getNextPage: () => dispatch(getNextPage(stateName, apiType)),
    resetEditState: () => dispatch(resetEditListItem(stateName))
  }
};


export {resetEditListItem};


// This class is infereing the wrong return so it explicitly stated 
/** A component to display, edit and delete a list of paginated elements */
export function ListHelperHOC<T>(ListComponent:ListHelperCreatedChild<T>):React.ComponentClass<OwnProps & T> {

  const CrudHelperWrapper = CrudHelperHOC<ListHelperCreateChildrenProps & T>(ListComponent)

  class InnerListHelper extends React.Component<ListHelperProps & T, {}>{
    componentWillMount(){
      console.log('componentWillMount');
    }
    componentWillUnmount(){
      this.props.resetEditState();
    }
    render(){
      return (
        <CrudHelperWrapper {...this.props}/>
      )
    }
  };
  return connect<{}, DispatchProps, OwnProps & T>(undefined, mapDispatchToProps)(InnerListHelper)
}