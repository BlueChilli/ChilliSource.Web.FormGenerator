import React, {isValidElement} from "react";
import {ListHelperHOC, ListHelperCreateChildrenProps, } from "./ListHelper";
import {PassedDownCrudHelperWrapperProps} from "./CrudHelperWrapper";
import {BaseReactProps} from "../../libs/types"
import CreateDisplayTable, {TableCol} from "../DisplayTable/DisplayTable";

const DisplayChildren = ListHelperHOC(CreateDisplayTable);

const TableHelper = ({children, ...props}:PassedDownCrudHelperWrapperProps) => {
  return (
    <DisplayChildren {...props}>
      {children} 
    </DisplayChildren>
  );
}


export default TableHelper;
export {TableCol};