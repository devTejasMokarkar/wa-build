const VERSION = process.env.WA_FLOW_VERSION || "7.3";

const TextInput = require("./components/TextInput");
const Dropdown = require("./components/Dropdown");
const CheckboxGroup = require("./components/CheckboxGroup");
const Footer = require("./components/Footer");

class Flow {

constructor(){

this.flow = {
version: VERSION,
screens:[]
};

this.currentScreen = null;
this.currentForm = null;
this.currentContainer = null;

}

screen(id,title,terminal=false){

const screen = {
id,
title,
terminal,
layout:{
type:"SingleColumnLayout",
children:[]
}
};

this.flow.screens.push(screen);

this.currentScreen = screen;
this.currentContainer = screen.layout.children;

return this;

}

routing(model){

this.flow.routing_model = model;
return this;

}

add(component){

if(!this.currentContainer){
throw new Error("No container available. Start with screen() or form()");
}

this.currentContainer.push(component);
return this;

}

form(name,initValues={}){

const form = {
type:"Form",
name
};

if(Object.keys(initValues).length){
form["init-values"] = initValues;
}

form.children = [];

this.currentScreen.layout.children.push(form);

this.currentForm = form;
this.currentContainer = form.children;

return this;

}

textInput(name,label,required=true,inputType="text"){
const component = new TextInput(name,label,required,inputType);
return this.add(component.build());
}

numberInput(name,label){

return this.textInput(name,label,true,"number");

}

emailInput(name,label){

return this.textInput(name,label,true,"email");

}

passwordInput(name,label){

return this.textInput(name,label,true,"password");

}

phoneInput(name,label){

return this.textInput(name,label,true,"phone");

}

dropdown(name,label,dataSource){

const component = new Dropdown(name,label,dataSource);

return this.add(component.build());

}

checkboxGroup(name,label,dataSource){

const component = new CheckboxGroup(name,label,dataSource);

return this.add(component.build());

}

footer(label, action="complete", next=null){

// if submit -> mark screen terminal
if(action === "complete" && this.currentScreen){
this.currentScreen.terminal = true;
}

const component = new Footer(label,action,next);

return this.add(component.build());

}

build(){

if(this.flow.routing_model && Object.keys(this.flow.routing_model).length === 0){
delete this.flow.routing_model;
}

return this.flow;

}

}

module.exports = Flow;