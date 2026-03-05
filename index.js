const Flow = require("./src/Flow");

const TextInput = require("./src/components/TextInput");
const CheckboxGroup = require("./src/components/CheckboxGroup");
const Dropdown = require("./src/components/Dropdown");

Flow.prototype.textInput = function(name,label,required=true,inputType="text"){

const component = new TextInput(name,label,required,inputType);

return this.add(component.build());

}

Flow.prototype.checkboxGroup = function(name,label,data){

const component = new CheckboxGroup(name,label,data);

return this.add(component.build());

}

Flow.prototype.dropdown = function(name,label,data){

const component = new Dropdown(name,label,data);

return this.add(component.build());

}

module.exports = Flow;