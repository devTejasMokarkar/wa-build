const Flow = require('./Flow');
const Router = require('./Router');
const { ValidationError, ErrorHandler } = require('./ErrorHandler');

class FlowBuilder {
  constructor(name, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('FlowBuilder name is required and must be a string', 'name', name);
      }
      
      this.flow = new Flow(name, options);
      this.router = new Router();
      this.dslMode = false;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.constructor', name, options });
      throw error;
    }
  }

  // DSL Method Chaining
  screen(id, options = {}) {
    try {
      if (!id || typeof id !== 'string') {
        throw new ValidationError('Screen ID is required and must be a string', 'id', id);
      }
      
      this.flow.screen(id, options.title, options.terminal);
      if (options.layout) {
        this.flow.currentScreen.layout.type = options.layout;
      }
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.screen', id, options });
      throw error;
    }
  }

  add(component) {
    try {
      if (!component) {
        throw new ValidationError('Component is required', 'component', component);
      }
      
      this.flow.add(component);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.add', component });
      throw error;
    }
  }

  text(name, label, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Text input name is required and must be a string', 'name', name);
      }
      
      this.flow.textInput(name, label, options.required, options.type || 'text', options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.text', name, label, options });
      throw error;
    }
  }

  dropdown(name, label, dataSource, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Dropdown name is required and must be a string', 'name', name);
      }
      
      if (!dataSource || !Array.isArray(dataSource)) {
        throw new ValidationError('Dropdown data source must be an array', 'dataSource', dataSource);
      }
      
      this.flow.dropdown(name, label, dataSource);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.dropdown', name, label, dataSource, options });
      throw error;
    }
  }

  checkbox(name, label, dataSource, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Checkbox name is required and must be a string', 'name', name);
      }
      
      if (!dataSource || !Array.isArray(dataSource)) {
        throw new ValidationError('Checkbox data source must be an array', 'dataSource', dataSource);
      }
      
      this.flow.checkboxGroup(name, label, dataSource);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.checkbox', name, label, dataSource, options });
      throw error;
    }
  }

  link(text, action, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Link text is required and must be a string', 'text', text);
      }
      
      if (!action) {
        throw new ValidationError('Link action is required', 'action', action);
      }
      
      this.flow.embeddedLink(text, action, options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.link', text, action, options });
      throw error;
    }
  }

  linkNavigate(text, targetScreen, payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Link navigate text is required and must be a string', 'text', text);
      }
      
      if (!targetScreen || typeof targetScreen !== 'string') {
        throw new ValidationError('Target screen is required and must be a string', 'targetScreen', targetScreen);
      }
      
      const EmbeddedLink = require("../components/EmbeddedLink");
      const component = EmbeddedLink.navigate(text, targetScreen, payload);
      this.flow.add(component.build());
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.linkNavigate', text, targetScreen, payload });
      throw error;
    }
  }

  linkComplete(text, payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Link complete text is required and must be a string', 'text', text);
      }
      
      const EmbeddedLink = require("../components/EmbeddedLink");
      const component = EmbeddedLink.complete(text, payload);
      this.flow.add(component.build());
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.linkComplete', text, payload });
      throw error;
    }
  }

  linkApi(text, endpoint, method = 'POST', payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Link API text is required and must be a string', 'text', text);
      }
      
      if (!endpoint || typeof endpoint !== 'string') {
        throw new ValidationError('API endpoint is required and must be a string', 'endpoint', endpoint);
      }
      
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!validMethods.includes(method.toUpperCase())) {
        throw new ValidationError(`Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(', ')}`, 'method', method);
      }
      
      const EmbeddedLink = require("../components/EmbeddedLink");
      const component = EmbeddedLink.api(text, endpoint, method, payload);
      this.flow.add(component.build());
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.linkApi', text, endpoint, method, payload });
      throw error;
    }
  }

  number(name, label, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Number input name is required and must be a string', 'name', name);
      }
      
      this.flow.numberInput(name, label, options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.number', name, label, options });
      throw error;
    }
  }

  email(name, label, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Email input name is required and must be a string', 'name', name);
      }
      
      this.flow.emailInput(name, label, options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.email', name, label, options });
      throw error;
    }
  }

  phone(name, label, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Phone input name is required and must be a string', 'name', name);
      }
      
      this.flow.phoneInput(name, label, options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.phone', name, label, options });
      throw error;
    }
  }

  password(name, label, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Password input name is required and must be a string', 'name', name);
      }
      
      this.flow.passwordInput(name, label, options);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.password', name, label, options });
      throw error;
    }
  }

  form(name, initValues = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Form name is required and must be a string', 'name', name);
      }
      
      this.flow.form(name, initValues);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.form', name, initValues });
      throw error;
    }
  }

  submit(label = 'Submit', action = 'complete') {
    try {
      if (!label || typeof label !== 'string') {
        throw new ValidationError('Submit label is required and must be a string', 'label', label);
      }
      
      if (!action || typeof action !== 'string') {
        throw new ValidationError('Submit action is required and must be a string', 'action', action);
      }
      
      this.flow.footer(label, action);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.submit', label, action });
      throw error;
    }
  }

  next(label = 'Next', screen) {
    try {
      if (!label || typeof label !== 'string') {
        throw new ValidationError('Next label is required and must be a string', 'label', label);
      }
      
      this.flow.footer(label, 'navigate', screen);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.next', label, screen });
      throw error;
    }
  }

  back(label = 'Back', screen) {
    try {
      if (!label || typeof label !== 'string') {
        throw new ValidationError('Back label is required and must be a string', 'label', label);
      }
      
      this.flow.footer(label, 'navigate', screen);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.back', label, screen });
      throw error;
    }
  }

  // Data handling
  data(key, value) {
    if (this.flow.currentScreen) {
      this.flow.currentScreen.data = this.flow.currentScreen.data || {};
      this.flow.currentScreen.data[key] = value;
    }
    return this;
  }

  // Footer method
  footer(label, action = 'complete', next = null) {
    try {
      if (!label || typeof label !== 'string') {
        throw new ValidationError('Footer label is required and must be a string', 'label', label);
      }
      
      if (!action || typeof action !== 'string') {
        throw new ValidationError('Footer action is required and must be a string', 'action', action);
      }
      
      this.flow.footer(label, action, next);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.footer', label, action, next });
      throw error;
    }
  }

  // Conditional routing
  when(condition, trueScreen, falseScreen) {
    try {
      if (!condition || typeof condition !== 'string') {
        throw new ValidationError('Condition is required and must be a string', 'condition', condition);
      }
      
      if (!trueScreen || typeof trueScreen !== 'string') {
        throw new ValidationError('True screen is required and must be a string', 'trueScreen', trueScreen);
      }
      
      this.flow.conditional(condition, trueScreen, falseScreen);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.when', condition, trueScreen, falseScreen });
      throw error;
    }
  }

  // Advanced routing with Router
  route(from, to, condition = null) {
    try {
      if (!from || typeof from !== 'string') {
        throw new ValidationError('Route origin is required and must be a string', 'from', from);
      }
      
      if (!to || typeof to !== 'string') {
        throw new ValidationError('Route destination is required and must be a string', 'to', to);
      }
      
      this.router.addRoute(from, to, condition);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.route', from, to, condition });
      throw error;
    }
  }

  default(screen) {
    try {
      if (!screen || typeof screen !== 'string') {
        throw new ValidationError('Default screen is required and must be a string', 'screen', screen);
      }
      
      this.router.setDefault(screen);
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.default', screen });
      throw error;
    }
  }

  // Validation
  validate() {
    try {
      this.flow.validate();
      return this;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.validate' });
      throw error;
    }
  }

  // Build methods
  build() {
    try {
      if (this.router.routes.size > 0) {
        const routingModel = this.router.buildRoutingModel();
        this.flow.routing(routingModel);
      }

      return this.flow.build();
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.build' });
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
      ErrorHandler.handle(error, { method: 'FlowBuilder.export', format });
      throw error;
    }
  }

  
  // Static factory method for DSL
  static create(name, options = {}) {
    try {
      return new FlowBuilder(name, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'FlowBuilder.create', name, options });
      throw error;
    }
  }

  // Enable DSL mode for cleaner syntax
  static enableDSL() {
    const builder = new FlowBuilder('temp');
    builder.dslMode = true;
    return builder;
  }
}

// Global DSL function
const createFlow = (name, options = {}) => {
  try {
    return new FlowBuilder(name, options);
  } catch (error) {
    ErrorHandler.handle(error, { method: 'createFlow', name, options });
    throw error;
  }
};

module.exports = { FlowBuilder, createFlow };
