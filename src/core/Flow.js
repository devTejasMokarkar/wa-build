const VERSION = process.env.WA_FLOW_VERSION || "7.3";
const { ValidationError, ComponentError, ScreenError, ErrorHandler } = require('./ErrorHandler');
const Validator = require('./Validator');
const Compiler = require('./Compiler');

class Flow {
  constructor(name, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Flow name is required and must be a string', 'name', name);
      }
      
      if (name.trim().length === 0) {
        throw new ValidationError('Flow name cannot be empty', 'name', name);
      }
      
      this.name = name.trim();
      this.version = options.version || "1.0.0";
      this.screens = [];
      this.routingModel = null;
      this.dataApiVersion = options.dataApiVersion || "3.0";
      
      try {
        this.validator = new Validator();
        this.compiler = new Compiler();
      } catch (error) {
        throw new Error(`Failed to initialize core components: ${error.message}`);
      }
      
      this.flow = {
        version: VERSION,
        data_api_version: this.dataApiVersion,
        screens: []
      };

      this.currentScreen = null;
      this.currentForm = null;
      this.currentContainer = null;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.constructor', name, options });
      throw error;
    }
  }

  screen(id, title, terminal = false) {
    try {
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Screen ID is required and must be a string', 'id', id);
      }
      
      if (id.trim().length === 0) {
        throw new ValidationError('Screen ID cannot be empty', 'id', id);
      }
      
      if (this.flow.screens.some(screen => screen.id === id.trim())) {
        throw new ScreenError(`Screen with ID '${id.trim()}' already exists`, id);
      }
      
      const screenId = id.trim();
      const screenTitle = typeof title === 'string' ? title.trim() : screenId;
      
      const screen = {
        id: screenId,
        title: screenTitle,
        terminal: Boolean(terminal),
        layout: {
          type: "SingleColumnLayout",
          children: []
        }
      };

      this.flow.screens.push(screen);
      this.currentScreen = screen;
      this.currentContainer = screen.layout.children;

      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.screen', id, title, terminal });
      throw error;
    }
  }

  routing(model) {
    try {
      if (!model || typeof model !== 'object') {
        throw new ValidationError('Routing model must be a valid object', 'routing', model);
      }
      
      if (Array.isArray(model)) {
        throw new ValidationError('Routing model must be an object, not an array', 'routing', model);
      }
      
      this.flow.routing_model = model;
      this.routingModel = model;
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.routing', model });
      throw error;
    }
  }

  add(component) {
    try {
      if (!this.currentContainer) {
        throw new ScreenError("No container available. Start with screen() or form()", this.currentScreen?.id);
      }

      if (!component || typeof component !== 'object') {
        throw new ComponentError("Component must be a valid object", 'unknown', 'unknown');
      }
      
      if (!component.type) {
        throw new ComponentError("Component must have a type property", 'unknown', 'unknown');
      }

      // Check EmbeddedLink limit
      const embeddedLinkCount = this.currentContainer.filter(c => c.type === 'EmbeddedLink').length;
      if (component.type === 'EmbeddedLink' && embeddedLinkCount >= 3) {
        throw new ComponentError(`Maximum EmbeddedLink limit (3) reached`, 'EmbeddedLink', this.currentScreen?.id);
      }

      this.currentContainer.push(component);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.add', component, screenId: this.currentScreen?.id });
      throw error;
    }
  }

  form(name, initValues = {}) {
    if (!name) {
      throw new Error('Form name is required');
    }

    const form = {
      type: "Form",
      name
    };

    if (Object.keys(initValues).length) {
      form["init-values"] = initValues;
    }

    form.children = [];

    if (!this.currentScreen) {
      throw new Error("No active screen. Start with screen() before adding form");
    }

    this.currentScreen.layout.children.push(form);
    this.currentForm = form;
    this.currentContainer = form.children;

    return this;
  }

  textInput(name, label, required = true, inputType = "text") {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Text input name is required and must be a string', 'name', name);
      }
      
      const TextInput = require("../components/TextInput");
      const component = new TextInput(name, label, required, inputType);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.textInput', name, label, required, inputType });
      throw error;
    }
  }

  numberInput(name, label) {
    return this.textInput(name, label, true, "number");
  }

  emailInput(name, label) {
    return this.textInput(name, label, true, "email");
  }

  passwordInput(name, label) {
    return this.textInput(name, label, true, "password");
  }

  phoneInput(name, label) {
    return this.textInput(name, label, true, "phone");
  }

  dropdown(name, label, dataSource) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Dropdown name is required and must be a string', 'name', name);
      }
      
      if (!dataSource || !Array.isArray(dataSource)) {
        throw new ValidationError('Dropdown data source must be an array', 'dataSource', dataSource);
      }
      
      const Dropdown = require("../components/Dropdown");
      const component = new Dropdown(name, label, dataSource);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.dropdown', name, label, dataSource });
      throw error;
    }
  }

  checkboxGroup(name, label, dataSource) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Checkbox group name is required and must be a string', 'name', name);
      }
      
      if (!dataSource || !Array.isArray(dataSource)) {
        throw new ValidationError('Checkbox group data source must be an array', 'dataSource', dataSource);
      }
      
      const CheckboxGroup = require("../components/CheckboxGroup");
      const component = new CheckboxGroup(name, label, dataSource);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.checkboxGroup', name, label, dataSource });
      throw error;
    }
  }

  embeddedLink(text, action, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Embedded link text is required and must be a string', 'text', text);
      }
      
      if (!action) {
        throw new ValidationError('Embedded link action is required', 'action', action);
      }
      
      const EmbeddedLink = require("../components/EmbeddedLink");
      const component = new EmbeddedLink(text, action, options);
      return this.add(component.build());
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.embeddedLink', text, action, options });
      throw error;
    }
  }

  footer(label, action = "complete", next = null) {
    const Footer = require("../components/Footer");
    
    if (action === "complete" && this.currentScreen) {
      this.currentScreen.terminal = true;
    }

    const component = new Footer(label, action, next);
    return this.add(component.build());
  }

  conditional(condition, trueScreen, falseScreen) {
    if (!this.routingModel) {
      this.routing({});
    }
    
    this.routingModel[condition] = {
      true: trueScreen,
      false: falseScreen
    };
    
    return this;
  }

  validate() {
    try {
      if (!this.validator) {
        throw new Error('Validator not initialized');
      }
      
      const errors = this.validator.validateFlow(this.flow);
      if (errors.length > 0) {
        throw new ValidationError(`Flow validation failed: ${errors.join(', ')}`);
      }
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.validate', flowName: this.name });
      throw error;
    }
  }

  build() {
    try {
      if (!this.compiler) {
        throw new Error('Compiler not initialized');
      }
      
      if (this.flow.routing_model && Object.keys(this.flow.routing_model).length === 0) {
        delete this.flow.routing_model;
      }

      return this.compiler.compile(this.flow);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.build', flowName: this.name });
      throw error;
    }
  }

  export(format = 'json') {
    try {
      const validFormats = ['json', 'minified', 'object'];
      if (!validFormats.includes(format)) {
        throw new ValidationError(`Invalid export format: ${format}. Valid formats: ${validFormats.join(', ')}`, 'format', format);
      }
      
      const builtFlow = this.build();
      
      switch (format) {
        case 'json':
          return JSON.stringify(builtFlow, null, 2);
        case 'minified':
          return JSON.stringify(builtFlow);
        case 'object':
          return builtFlow;
        default:
          return builtFlow;
      }
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Flow.export', format, flowName: this.name });
      throw error;
    }
  }
}

module.exports = Flow;
