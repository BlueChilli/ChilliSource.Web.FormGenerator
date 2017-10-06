import React, { isValidElement } from "react";
import { Iterable } from "immutable";
import { BaseReactProps } from "cs.core";
import { startCase, isFunction } from "lodash";

interface TableColProps extends BaseReactProps {
  /** Label to display in the header of the table */
  headerLabel?: string;
  /** Matches the name of the data in the schema */
  name: string;
  /** a function to transform the data displayed inside the td */
  transform?: (name?: string, props?: Object) => React.ReactChild;
  /** Class to put on the corrosponding td */
  tdClassName?: string;
  /** a react element to display inside the td */
  children?: React.ReactElement<any>;
}

type TableColElement = React.ReactElement<TableColProps>;

// Im used don't delete me
export const TableCol = (props: TableColProps) => <noscript />;

interface DisplayTableProps extends BaseReactProps {
  /** data to populate the table with */
  data: Iterable<string | number, any>;
}

class DisplayTable<T> extends React.PureComponent<DisplayTableProps & T, {}> {
  render() {
    const { data, children, className } = this.props;
    const removeInvalidElements = React.Children
      .toArray(children)
      .filter(isValidElement);
    return (
      <table className={className}>
        <thead>
          <tr>
            {removeInvalidElements.map((tableCol: TableColElement) => {
              if (isValidElement(tableCol)) {
                const { headerLabel, name, className } = tableCol.props;
                return (
                  <th className={className}>
                    {headerLabel || startCase(name)}
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((dataItem: Map<string, any>) => (
            <tr
              className={
                dataItem.has("disabled") && dataItem.get("disabled")
                  ? "disabled"
                  : false
              }
            >
              {removeInvalidElements.map((tableCol: TableColElement) => {
                if (isValidElement(tableCol) && tableCol && tableCol.props) {
                  const {
                    name,
                    transform,
                    tdClassName,
                    children: tableColChildren
                  } = tableCol.props;
                  if (
                    name &&
                    Iterable.isIterable(dataItem) &&
                    dataItem.has(name)
                  ) {
                    if (isFunction(transform)) {
                      return (
                        <td className={tdClassName}>
                          {transform(
                            dataItem.get(name),
                            Object.assign({}, { dataItem }, this.props)
                          )}
                        </td>
                      );
                    } else {
                      return (
                        <td className={tdClassName}>{dataItem.get(name)}</td>
                      );
                    }
                  } else if (
                    React.Children.count(tableCol) === 1 &&
                    tableColChildren
                  ) {
                    return (
                      <td className={tdClassName}>
                        {React.cloneElement(
                          tableColChildren,
                          Object.assign({}, { dataItem }, this.props)
                        )}
                      </td>
                    );
                  }
                }
                return <td />;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default DisplayTable;
