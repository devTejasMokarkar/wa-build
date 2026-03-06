// Main entry point for WhatsApp Flow Builder Framework

const { ErrorHandler, FlowError } = require('./src/core/ErrorHandler');

try {
  // Core imports
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

  // Validate required imports
  const requiredImports = {
    Flow, FlowBuilder, createFlow, Screen, Router, Validator, Compiler,
    TextInput, Dropdown, CheckboxGroup, Footer, TextBody, EmbeddedLink,
    SubmitAction, NavigateAction, ApiCallAction
  };
  
  const missingImports = Object.entries(requiredImports)
    .filter(([name, value]) => !value)
    .map(([name]) => name);
    
  if (missingImports.length > 0) {
    throw new FlowError(`Missing required imports: ${missingImports.join(', ')}`, 'IMPORT_ERROR');
  }

  // Add DSL methods to Flow prototype for backward compatibility
  Flow.prototype.textInput = function(name, label, required = true, inputType = "text", options = {}) {
    try {
      const component = new TextInput(name, label, required, inputType, options);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.prototype.textInput', name, label });
      throw error;
    }
  };

  Flow.prototype.checkboxGroup = function(name, label, dataSource, options = {}) {
    try {
      const component = new CheckboxGroup(name, label, dataSource, options);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.prototype.checkboxGroup', name, label });
      throw error;
    }
  };

  Flow.prototype.dropdown = function(name, label, dataSource, options = {}) {
    try {
      const component = new Dropdown(name, label, dataSource, options);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.prototype.dropdown', name, label });
      throw error;
    }
  };

  Flow.prototype.textBody = function(content) {
    try {
      const component = new TextBody(content);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.prototype.textBody', content });
      throw error;
    }
  };

  Flow.prototype.footer = function(label, action = "complete", next = null) {
    try {
      const component = new Footer(label, action, next);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.prototype.footer', label, action, next });
      throw error;
    }
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
    
    // Error handling utilities
    ErrorHandler,
    FlowError,
    
    // Legacy export
    Flow
  };
  
} catch (error) {
  ErrorHandler.handle(error, { method: 'index.js.main' });
  
  // In production, export a safe fallback
  module.exports = {
    ErrorHandler,
    FlowError,
    createFlow: () => {
      throw new FlowError('Framework failed to initialize properly', 'INITIALIZATION_ERROR');
    }
  };
  
  // Re-throw in development for debugging
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
}