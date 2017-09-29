import React, { cloneElement } from "react";
import PropTypes from "prop-types";
import { Map, List, Iterable } from "immutable";
import classnames from "classnames";
import {
  Input,
  CheckBox,
  TextArea,
  Radio,
  Select,
  Validate,
  DropZone,
  Number,
  DatePicker,
  InputUnionProps,
  validationsAvailable
} from "cs.forms";
import { getContext, withProps, compose } from "recompose";
import { isUndefined, size } from "lodash";
import GetAPIforRender from "./GetApiForRender";

import { BaseReactProps } from "cs.core";
import { swaggerApiRequest } from "../../libs/fetchSchema";

interface GetContextProps extends BaseReactProps {
  name: string;
  formSchema: Map<string, any>;
}

interface WithPropsProps extends GetContextProps {
  attributes: Map<string, any>;
}

const chooseSwitchControl = (inputAttributes: Map<string, any>) => {
  if (inputAttributes.get("type") === "checkbox") {
    return (value: Map<string, any>) => (
      <CheckBox
        label={value.get("text", value.get("label"))}
        name={inputAttributes.get("name") + "[]"}
        id={value.get("value")}
        key={value.get("value")}
      />
    );
  } else {
    return (value: Map<string, any>) => (
      <Radio
        defaultChecked={inputAttributes.get("defaultValue") + ""}
        label={value.get("description", value.get("label"))}
        name={inputAttributes.get("name")}
        id={value.get("value")}
        key={value.get("value")}
      />
    );
  }
};

const displaySwitches = (inputAttributes: Map<string, any>, options) => {
  const classes = classnames(
    "input-mapper-switch-container",
    inputAttributes.get("className")
  );
  return (
    <div className={classes}>
      <label htmlFor="#">{inputAttributes.get("label")}</label>
      {options.map(chooseSwitchControl(inputAttributes)).toArray()}
      {validationsAvailable(inputAttributes.toJS()).length > 0 && (
        <Validate
          {...inputAttributes.toJS()}
          name={inputAttributes.get("name") + "[]"}
        />
      )}
    </div>
  );
};

interface ApiSelectProps {
  array: List<Map<string, any>>;
  multiple: boolean;
}

const ApiSelect = ({ array, multiple = false, ...props }: ApiSelectProps) => {
  return (
    <select {...props} multiple={multiple}>
      {array.map((item: Map<string, any>) => (
        <option value={item.get("id")}>{item.get("description")}</option>
      ))}
    </select>
  );
};

interface InputMapperProps {
  /** Matches a key in the Form Schema passed down by the parent FormGenerator. Is used to match InputMapper with the correct attributes  */
  name: string;
  /** User can pass in a custom component for InputMapper to render instead of the default options */
  component?: React.ReactElement<any>;
  /** Passed as children to the chosen component currently only supported by Select and custom components */
  children?: React.ReactElement<any>;
}

/**
 * Allows the user to create a custom layout for the FormGenerator. Must have a FormGenerator component as a parent
 * Note: this is used internally to generate a form as well.
 */
class InputMapper extends React.Component<
  InputMapperProps & InputUnionProps & WithPropsProps,
  {}
> {
  mapInput(inputAttributes: Map<string, any>) {
    const type = inputAttributes.get("type", "");
    if (this.props.component) {
      if (
        inputAttributes.hasIn(
          ["items", "x-blue-ApiResourceReference", "api"]
        ) ||
        inputAttributes.has("x-blue-ApiResourceReference")
      ) {
        const api: swaggerApiRequest = inputAttributes.getIn(
          ["items", "x-blue-ApiResourceReference", "api"],
          inputAttributes.get("x-blue-ApiResourceReference")
        );
        return (
          <GetAPIforRender api={api}>
            {cloneElement(this.props.component, {
              ...inputAttributes.toJS(),
              ...this.props,
              ...this.props.component.props
            })}
          </GetAPIforRender>
        );
      } else {
        return cloneElement(this.props.component, {
          ...inputAttributes.toJS(),
          ...this.props,
          ...this.props.component.props
        });
      }
    } else if (inputAttributes.has("x-blue-ApiResourceReference")) {
      return (
        <GetAPIforRender
          api={inputAttributes.get("x-blue-ApiResourceReference")}
        >
          <ApiSelect {...inputAttributes.toJS()} />
        </GetAPIforRender>
      );
    } else if (type === "checkbox") {
      const classes = classnames(
        "input-mapper-switch-container",
        inputAttributes.get("className")
      );
      if (inputAttributes.get("options").size > 0) {
        return displaySwitches(inputAttributes, inputAttributes.get("options"));
      } else {
        const safeInputAttributes = inputAttributes.delete("options");
        return (
          <div className={classes}>
            <CheckBox {...safeInputAttributes.toJS()} />
          </div>
        );
      }
    } else if (type === "boolean") {
      const classes = classnames(
        "input-mapper-switch-container",
        inputAttributes.get("className")
      );
      return (
        <div className={classes}>
          <CheckBox {...inputAttributes.delete("type").toJS()} />
        </div>
      );
    } else if (type === "number") {
      return <Number {...inputAttributes.toJS()} />;
    } else if (type === "array") {
      const api: swaggerApiRequest = inputAttributes.getIn([
        "items",
        "x-blue-ApiResourceReference",
        "api"
      ]);
      if (!isUndefined(api)) {
        return (
          <GetAPIforRender api={api}>
            <ApiSelect multiple {...inputAttributes.toJS()} />
          </GetAPIforRender>
        );
      } else {
        console.warn(
          "Elements of type array without api references are not currently supported by the input mapper please specify your own component"
        );
        return <div>Component name: {this.props.name}</div>;
      }
    } else if (type === "file") {
      return (
        <div>
          <label htmlFor={inputAttributes.get("name")}>
            {inputAttributes.get("label")}
          </label>
          <DropZone {...inputAttributes.toJS()} multiple={false}>
            <span>Drop stuff here</span>
          </DropZone>
        </div>
      );
    } else if (inputAttributes.get("format", false) === "date-time") {
      return <DatePicker {...inputAttributes.toJS()} />;
    } else if (inputAttributes.get("enum", false)) {
      const selectAttributes = inputAttributes.delete("options");
      if (inputAttributes.has("children")) {
        return (
          <Select {...selectAttributes.toJS()}>
            {React.Children.toArray(inputAttributes.get("children").toJS())}
          </Select>
        );
      } else {
        return (
          <Select {...selectAttributes.toJS()}>
            {inputAttributes
              .get("options", Map())
              .map((value: Map<string, any>, key: string | number) => (
                <option value={value.get("value")} key={key}>
                  {value.get("description") || key}
                </option>
              ))
              .toArray()}
          </Select>
        );
      }
    } else if (inputAttributes.get("maxLength", false) >= 100) {
      const safeInputAttributes = inputAttributes.delete("type");
      return <TextArea {...safeInputAttributes.toJS()} />;
    } else if (inputAttributes.get("hidden", false)) {
      return <noscript />;
    } else {
      const safeInputAttributes = inputAttributes.delete("type");
      return <Input {...safeInputAttributes.toJS()} />;
    }
  }
  render() {
    const inputAttributes = this.props.attributes.merge(this.props);
    return this.mapInput(inputAttributes);
  }
}

// TODO: the 2nd argument in the generic should be "InputMapperProps & InputUnionProps" waiting on a fix coming in TS 2.3.
export default compose<WithPropsProps, InputMapperProps & any>(
  getContext({
    formSchema: PropTypes.any
  }),
  withProps((props: GetContextProps) => {
    const { name, formSchema, className } = props;
    const attributes: Map<string, any> = formSchema.get(name, Map({}));
    const renameAttributes = attributes.mapEntries(
      ([key, value]: [string, any]) => {
        if (key === "title") {
          return ["label", value];
        } else if (key === "x-sys-Required") {
          return ["required", !value.get("allowEmptyStrings")];
        } else if (key === "x-blue-Hidden") {
          return ["hidden", true];
        } else if (key === "x-blue-enum-definitions") {
          return ["options", value];
        } else if (key === "x-blue-HttpPostedFileBaseFileExtensions") {
          return ["accept", value.get("accept")];
        } else if (key === "x-blue-FileMaxSize") {
          return ["fileMaxSize", value.get("maxSize")];
        } else if (key === "minLength" && value === 0) {
          return [key, false];
        } else if (key === "x-blue-ApiResourceReference") {
          const resourceName: string = value.get("resourceName");
          return [
            key,
            (window as any).client.getIn([
              resourceName,
              resourceName + "_Query",
              "api"
            ])
          ];
        } else if (
          Iterable.isIterable(value) &&
          value.has("x-blue-ApiResourceReference")
        ) {
          const resourceName: string = value.getIn([
            "x-blue-ApiResourceReference",
            "resourceName"
          ]);
          const resourcePath = resourceName.split("/");
          if (size(resourcePath) > 1) {
            return [
              key,
              value.setIn(
                ["x-blue-ApiResourceReference", "api"],
                (window as any).client.getIn([
                  resourcePath[0],
                  `${resourcePath[0]}_${resourcePath[1]}`,
                  "api"
                ])
              )
            ];
          } else {
            return [
              key,
              value.setIn(
                ["x-blue-ApiResourceReference", "api"],
                (window as any).client.getIn([
                  resourceName,
                  resourceName + "_Query",
                  "api"
                ])
              )
            ];
          }
        }
        return [key, value];
      }
    );
    return {
      attributes: renameAttributes,
      className: classnames(name, className)
    };
  })
)(InputMapper);
