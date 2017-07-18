import {CrudHelperHOC, CrudHelperInjectedProps} from "./CrudHelperWrapper";

export interface ItemHelperInjectedProps extends CrudHelperInjectedProps {};

export function ItemHelperHOC<T> (Component) {return CrudHelperHOC<T>(Component)}
