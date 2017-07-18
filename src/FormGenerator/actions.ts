/** Libraries */
import { Map } from 'immutable';

/** Helpers */
import { getFirstPath } from '../CrudHelpers/Helpers/stateHelpers';
import { startSpinner, endSpinner } from '../../Components/ButtonSpinner/Action/ButtonSpinner';
import { apiRequestDataMap, apiResponseDataMap, swaggerApi } from '../../libs/types';
import { dispatchPostAction } from './actionHelpers';


export type OnSubmitSuccess = (response?: apiResponseDataMap, request?: apiRequestDataMap) => void;

/**
 * Submits a form, shows an alert if required and fires the appropriate action
 * after receiving a response from the API
 * @param formName 
 * @param formData 
 * @param api 
 * @param apiType 
 * @param stateName 
 * @param onSubmitSuccess 
 * @param onSubmitError 
 */
export const submitGeneratedForm = (formName: string, formData: apiRequestDataMap, api: swaggerApi, apiType, stateName: string, onSubmitSuccess: OnSubmitSuccess, onSubmitError: OnSubmitSuccess) => {
  return dispatch => {
    dispatch(startSpinner(formName));
    dispatchPostAction(dispatch, api, formData)(stateName).then((data) => {
      if (onSubmitSuccess) {
        onSubmitSuccess(data, formData);
      }
      return data;
    }).catch((err) => {
      if (onSubmitError) {
        onSubmitError(err, formData);
      }
      return err;
    }).then(() => {
      dispatch(endSpinner(formName));
    });
  }
};
