class CheckboxGroup {

constructor(name,label,dataSource,options={}){
if (!name) throw new Error('CheckboxGroup name is required');
if (!label) throw new Error('CheckboxGroup label is required');
if (!dataSource || !Array.isArray(dataSource)) {
throw new Error('CheckboxGroup dataSource must be a non-empty array');
}

this.name = name;
this.label = label;
this.dataSource = dataSource;
this.required = options.required || false;
this.minSelections = options.minSelections || 0;
this.maxSelections = options.maxSelections || dataSource.length;
this.defaultValue = options.defaultValue || [];
this.helperText = options.helperText || '';
}

build(){
const component = {
type:"CheckboxGroup",
name:this.name,
label:this.label,
"data-source":this.dataSource,
required:this.required
};

if (this.minSelections > 0) component["min-selections"] = this.minSelections;
if (this.maxSelections < this.dataSource.length) component["max-selections"] = this.maxSelections;
if (this.defaultValue.length > 0) component["default-value"] = this.defaultValue;
if (this.helperText) component["helper-text"] = this.helperText;

return component;
}

}

module.exports = CheckboxGroup;