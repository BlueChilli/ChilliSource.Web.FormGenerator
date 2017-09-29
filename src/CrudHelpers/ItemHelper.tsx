import { ComponentType } from "react";
import { CrudHelperHOC, CrudHelperInjectedProps } from "./CrudHelperWrapper";

export interface ItemHelperInjectedProps extends CrudHelperInjectedProps {}

export function ItemHelperHOC<T>(ItemComponent: ComponentType<any>) {
  return CrudHelperHOC<T>(ItemComponent);
}
