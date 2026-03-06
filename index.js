// Main entry point for WhatsApp Flow Builder Framework

const Flow = require("./src/core/Flow");
const { FlowBuilder, createFlow } = require("./src/core/FlowBuilder");
const Screen = require("./src/core/Screen");
const Router = require("./src/core/Router");
const Validator = require("./src/core/Validator");
const Compiler = require("./src/core/Compiler");

// Component imports
const TextInput = require("./src/components/TextInput");
const Dropdown = require("./src/components/Dropdown");
const CheckboxGroup = require("./src/components/CheckboxGroup");
const Footer = require("./src/components/Footer");
const TextBody = require("./src/components/TextBody");
const EmbeddedLink = require("./src/components/EmbeddedLink");

// Action imports
const SubmitAction = require("./src/actions/SubmitAction");
const NavigateAction = require("./src/actions/NavigateAction");
const ApiCallAction = require("./src/actions/ApiCallAction");

// Add DSL methods to Flow prototype for backward compatibility
Flow.prototype.textInput = function(name, label, required = true, inputType = "text", options = {}) {
  const component = new TextInput(name, label, required, inputType, options);
  return this.add(component.build());
};

Flow.prototype.checkboxGroup = function(name, label, dataSource, options = {}) {
  const component = new CheckboxGroup(name, label, dataSource, options);
  return this.add(component.build());
};

Flow.prototype.dropdown = function(name, label, dataSource, options = {}) {
  const component = new Dropdown(name, label, dataSource, options);
  return this.add(component.build());
};

// Export main classes
module.exports = {
  // Core classes
  Flow,
  FlowBuilder,
  Screen,
  Router,
  Validator,
  Compiler,
  
  // DSL factory
  createFlow,
  
  // Components
  TextInput,
  Dropdown,
  CheckboxGroup,
  Footer,
  TextBody,
  EmbeddedLink,
  
  // Actions
  SubmitAction,
  NavigateAction,
  ApiCallAction,
  
  // Legacy export
  Flow
};