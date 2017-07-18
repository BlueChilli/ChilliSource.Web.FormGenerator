import React from 'react'; 
import PropTypes from 'prop-types';
import { Map, List, Set, fromJS, Iterable } from "immutable";
import { connect } from "react-redux";
import {Dispatch} from "redux";
import Thunk from "redux-thunk";
import { submitGeneratedForm, OnSubmitSuccess } from "./actions";
import {FormOptionalProps} from "cs.forms"
import FormSubmit from "../FormSubmit/FormSubmit";
import {camelCase, upperFirst } from "lodash";

import {BaseAction, BaseReactProps, ShallowCompare} from "../../libs/types";

import {getSwaggerModel, getSwaggerParamaters, getPropertiesByDataFormat} from "../../Helpers/swaggerHelpers";

import { withProps, defaultProps, compose } from "recompose";

type SubmitGeneratedForm = (ShallowCompare) => undefined

export interface FormGeneratorProps extends FormOptionalProps<SubmitGeneratedForm>{
 /** The Swagger key used to retrieve the form schema. You do not need to include the basename or the origin */
    apiType: string,
    /** The Swagger submission type if it's not an Add or Update request */
    apiVerb?: string,
    /** FSA type to execute post and edit actions on */
    stateName: string,
    /** Provide a custom on submit implementation */
    onSubmit?: (any, ShallowCompare, SubmitGeneratedForm) => undefined,
    /** Text to display on the submit button */
    buttonText?: string
    /** Executed on successfully adding the the form data to both server and application state */
    onSubmitSuccess?: OnSubmitSuccess,
    /** Executed on a failed attempt to adding the the form data to server and application state */
    onSubmitError?: OnSubmitSuccess,
    /** A map that accepts to properties rename and transform. Rename is a string that replaces the key of the data
     * transform is a function that returns transformed data */
    mapInputs?: (ShallowCompare) => ShallowCompare,
    /** Id of the data inside apiType you wish to edit */
    editId?: number,
    /** Arguments to merge into the form as default values */
    editArgs?: Map<string, ShallowCompare>,
    /** Removes fields not avaliable to the user based on their role */
    roles?: List<string>,
    /** Display avaliable fields */
    debug?: boolean,
    /** fields to be rendered by the form generator -- Mainly internal usage */
    properties?: List<any> | Map<string, any>,
    /** Type of request for the FormGenerator to make -- default is 'post' */
    formMethod?: string
}

interface ConnectFormGenProps extends FormGeneratorProps{
  editArgs: Map<string, ShallowCompare>,
  dispatch: (dispatch) => undefined
}

interface WithPropsBaseSwaggerInfo extends ConnectFormGenProps {
  properties: List<any> | Map<string, any>,
  baseInfo: Map<string, any>,
  parameters: Map<string, any>
}


interface WithPropsFormGen extends WithPropsBaseSwaggerInfo {
  encType: 'application/json' | 'multipart/form-data',
  name: string,
  submitGeneratedForm: SubmitGeneratedForm
}



/** Retrieves a form schema from the server then generates a form. InputMapper can be used with the component to create
 * more customized layouts, built on FrECL forms and accepts the same arguments as FormSubmit */
class FormGenerator extends React.Component<WithPropsFormGen, {}>{

  public static childContextTypes = {
    formSchema: PropTypes.object,
    registerInputMapper: PropTypes.func,
    unregisterInputMapper: PropTypes.func
  }

  getChildContext() {
    return {
      formSchema: this.props.properties,
    }
  }
  
  handleSubmit = (e, formData) => {
    if (this.props.onSubmit) {
      this.props.onSubmit(e, formData, this.props.submitGeneratedForm);
    } else {
      this.props.submitGeneratedForm(formData);
    }
  }

  render() {
    const {stateName, onSubmitSuccess, submitGeneratedForm, children, properties, buttonText = "Submit", onSubmit, formMethod, ...safeProps} = this.props;
    return (
      <FormSubmit stateName={ safeProps.name } buttonText={ buttonText } onSubmit={ this.handleSubmit } {...safeProps}>
        { children }
      </FormSubmit>
      );
  }
};

const mapStateToProps = (state, {apiType, editId = false, editArgs = Map()}) => {
  const stateLocation = `${compose(upperFirst, camelCase)(apiType)}State`;
  const editIdPath = editId ? editId : state.getIn([stateLocation, 'editItem', 'id'], Map({}));
  return {
    editArgs: state.getIn([stateLocation, apiType, 'data', editIdPath], Map({})).merge(editArgs)
  };
};


const createControlsEdit = (properties = Map<string, any>(), editArgs = Map()) => {
  return properties.map((value, key) => {
    if (editArgs.has(key)) {
      return value.merge({
        defaultValue: fromJS(editArgs.get(key), (key, value) => {
          return value.toMap();
        })
      });
    } else if (editArgs.hasIn([key, 'fullAddress'])) {
      return value.merge({
        defaultValue: fromJS(editArgs.getIn([key, 'fullAddress'], ''))
      });
    }
    return value;
  });
};

const removeFieldsByRole = (properties, roles = List([])) => {
  if (List.isList(roles) && roles.size > 0) {
    return properties.filter(value => {
      if (value.hasIn(['x-blue-ApiVisibility', 'roles'])) {
        const fieldRoles = value.getIn(['x-blue-ApiVisibility', 'roles']);
        return fieldRoles.some(value => {
          return roles.keyOf(value) !== undefined;
        });
      }
      return true;
    })
  }
  return properties;
};

const mapInputs = (editArgs, mapInputsFunction = (args) => args) => {
  return mapInputsFunction(editArgs);
};

const getProperties = (parameters, apiVerb, encType, formMethod) : List<any> | Map<string, any> =>{
  if(formMethod === 'get'){
    return parameters.get('query', List()).reduce((reduction, parameter) => {
      return reduction.set(parameter.get('name'), parameter);
    }, Map());
  } else if (encType === 'application/json') {
    return parameters.getIn(['body', 0, 'schema', 'properties']);
  } else if (encType === 'multipart/form-data') {
    return parameters.getIn(['formData', 0, 'schema', 'properties'],  Map());
  } else {
    throw new Error(`encType ${encType} is not supported by the form generator`);
  }
}

const createApiForFormMethod = (formMethod:string, baseInfo:Map<string, any>, pathArgs) => {
  if(formMethod === 'get') {
    return data => baseInfo.get('api')(undefined, data.toJS(), pathArgs);
  } else {
    return data => baseInfo.get('api')(data, undefined, pathArgs);
  }
} 


// TODO: populate this with swagger information
export default compose<WithPropsFormGen, FormGeneratorProps>(
  connect(mapStateToProps),
  withProps((props:ConnectFormGenProps) => {
    const {apiType, formMethod = 'post'} = props;
    const submitType = props.editArgs.size > 0 ? "Update" : "Add";
    const {apiVerb = submitType} = props;
    const baseInfo = getSwaggerModel(apiType, apiVerb);
    const {encType = baseInfo.getIn(['consumes', 0 ], 'application/json')} = props;
    const parameters = getSwaggerParamaters(apiType, apiVerb)
    const properties = props.properties ? props.properties : getProperties(parameters, apiVerb, encType, formMethod);

    return {
      baseInfo,
      parameters,
      properties, 
      apiVerb
    }
  }),
  withProps((props:WithPropsBaseSwaggerInfo) => {
    const {dispatch, apiType, stateName, onSubmitSuccess, onSubmitError, debug, properties, baseInfo, parameters, apiVerb, formMethod} = props;
    if(debug){
      console.log(properties.toJS());
    }
    const pathArgs = parameters.get('path', Map({})).toMap().mapEntries(entries => {
      const value = entries[1];
      return [value.get('name'), props.editArgs.get(value.get('name'))];
    });
    const roleSafeProperties = removeFieldsByRole(properties, props.roles);
    const mappedEditArgs = mapInputs(props.editArgs, props.mapInputs);
    const api = createApiForFormMethod(formMethod, baseInfo, pathArgs)
    const name = apiType + '_' + apiVerb;
    return {
      properties: createControlsEdit(roleSafeProperties, mappedEditArgs),
      encType: baseInfo.getIn(['consumes', 0]),
      name,
      submitGeneratedForm: (formData) => dispatch(submitGeneratedForm(name, formData, api, apiType, stateName, onSubmitSuccess, onSubmitError))
    };
  })
)(FormGenerator)
