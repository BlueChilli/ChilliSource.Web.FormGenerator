import React from "react";
import FormGenerator, {FormGeneratorProps} from "../FormGenerator/FormGenerator";

export default ({formMethod = "get", children, ...props} : FormGeneratorProps) => (
  <FormGenerator formMethod={formMethod} {...props}>
    {children}
  </FormGenerator>
);