class TextInput {

constructor(name,label,required=true,inputType="text",options={}){
if (!name) throw new Error('TextInput name is required');
if (!label) throw new Error('TextInput label is required');

this.name = name;
this.label = label;
this.required = required;
this.inputType = inputType;
this.placeholder = options.placeholder || '';
this.maxLength = options.maxLength || null;
this.minLength = options.minLength || null;
this.defaultValue = options.defaultValue || '';
this.validation = options.validation || {};
this.helperText = options.helperText || '';
}

build(){
const component = {
type:"TextInput",
name:this.name,
label:this.label,
required:this.required,
"input-type":this.inputType
};

if (this.placeholder) component.placeholder = this.placeholder;
if (this.maxLength) component["max-length"] = this.maxLength;
if (this.minLength) component["min-length"] = this.minLength;
if (this.defaultValue) component["default-value"] = this.defaultValue;
if (this.helperText) component["helper-text"] = this.helperText;
if (Object.keys(this.validation).length > 0) component.validation = this.validation;

return component;
}

}

module.exports = TextInput;