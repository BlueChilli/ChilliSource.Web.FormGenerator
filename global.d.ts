import { Map, Seq, Iterable } from "immutable";

declare global {
  const client: Map<string, any>;
  interface Window {
    client: Seq.Keyed<any, Iterable<string | number, any>>;
    __REDUX_DEVTOOLS_EXTENSION__: () => void;
  }
}
