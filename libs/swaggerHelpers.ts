import { Map } from "immutable";

declare var window: any;

export const getSwaggerModel = (
  apiType: string,
  apiVerb: string
): Map<string, any> =>
  window.client.getIn([apiType, `${apiType}_${apiVerb}`], Map({}));

export const getSwaggerParamaters = (apiType: string, apiVerb: string) => {
  const baseInfo = getSwaggerModel(apiType, apiVerb);
  return baseInfo
    .get("parameters", Map())
    .groupBy((value: Map<string, any>) => value.get("in"));
};

type InnerGetPropertiesByDataFormat = (
  dataFormat: string[],
  index: number
) => Map<string, any>;

export const getPropertiesByDataFormat = (
  apiType: string,
  apiVerb: string,
  dataFormat: string[],
  index = 0
) => {
  const parameters = getSwaggerParamaters(apiType, apiVerb);
  const innerGetPropertiesByDataFormat: InnerGetPropertiesByDataFormat = (
    dataFormat,
    index = 0
  ) => {
    const currentParameters: Map<string, any> | false = parameters.getIn(
      [dataFormat[index], 0, "schema", "properties"],
      parameters.getIn([dataFormat[index]], false)
    );
    if (index > dataFormat.length) {
      throw new Error("Data format does not exist in swagger schema");
    } else if (currentParameters) {
      return currentParameters;
    } else {
      return innerGetPropertiesByDataFormat(dataFormat, index + 1);
    }
  };
  return innerGetPropertiesByDataFormat(dataFormat, index);
};
