import {camelCase, upperFirst, flow} from "lodash";

export function getFirstPath(stateName:string):string {
  return flow<string, string, string>(camelCase, upperFirst)(stateName);
}

export function getTopStatePath(stateName:string) {
  return getFirstPath(stateName) + "State";
}

export function splitPath(pathname:string) {
  return pathname.split('/');
}