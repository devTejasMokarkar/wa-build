const Flow = require('./Flow');
const Router = require('./Router');

class FlowBuilder {
  constructor(name, options = {}) {
    this.flow = new Flow(name, options);
    this.router = new Router();
    this.dslMode = false;
  }

  // DSL Method Chaining
  screen(id, options = {}) {
    this.flow.screen(id, options.title, options.terminal);
    if (options.layout) {
      this.flow.currentScreen.layout.type = options.layout;
    }
    return this;
  }

  add(component) {
    this.flow.add(component);
    return this;
  }

  text(name, label, options = {}) {
    this.flow.textInput(name, label, options.required, options.type, options);
    return this;
  }

  dropdown(name, label, dataSource, options = {}) {
    this.flow.dropdown(name, label, dataSource);
    return this;
  }

  checkbox(name, label, dataSource, options = {}) {
    this.flow.checkboxGroup(name, label, dataSource);
    return this;
  }

  link(text, action, options = {}) {
    this.flow.embeddedLink(text, action, options);
    return this;
  }

  linkNavigate(text, targetScreen, payload = {}) {
    const EmbeddedLink = require("../components/EmbeddedLink");
    const component = EmbeddedLink.navigate(text, targetScreen, payload);
    this.flow.add(component.build());
    return this;
  }

  linkComplete(text, payload = {}) {
    const EmbeddedLink = require("../components/EmbeddedLink");
    const component = EmbeddedLink.complete(text, payload);
    this.flow.add(component.build());
    return this;
  }

  linkApi(text, endpoint, method = 'POST', payload = {}) {
    const EmbeddedLink = require("../components/EmbeddedLink");
    const component = EmbeddedLink.api(text, endpoint, method, payload);
    this.flow.add(component.build());
    return this;
  }

  number(name, label, options = {}) {
    this.flow.numberInput(name, label, options);
    return this;
  }

  email(name, label, options = {}) {
    this.flow.emailInput(name, label, options);
    return this;
  }

  phone(name, label, options = {}) {
    this.flow.phoneInput(name, label, options);
    return this;
  }

  password(name, label, options = {}) {
    this.flow.passwordInput(name, label, options);
    return this;
  }

  form(name, initValues = {}) {
    this.flow.form(name, initValues);
    return this;
  }

  submit(label = 'Submit', action = 'complete') {
    this.flow.footer(label, action);
    return this;
  }

  next(label = 'Next', screen) {
    this.flow.footer(label, 'navigate', screen);
    return this;
  }

  back(label = 'Back', screen) {
    this.flow.footer(label, 'navigate', screen);
    return this;
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
    this.flow.footer(label, action, next);
    return this;
  }

  // Conditional routing
  when(condition, trueScreen, falseScreen) {
    this.flow.conditional(condition, trueScreen, falseScreen);
    return this;
  }

  // Advanced routing with Router
  route(from, to, condition = null) {
    this.router.addRoute(from, to, condition);
    return this;
  }

  default(screen) {
    this.router.setDefault(screen);
    return this;
  }

  // Data handling
  data(key, value) {
    if (this.flow.currentScreen) {
      this.flow.currentScreen.data = this.flow.currentScreen.data || {};
      this.flow.currentScreen.data[key] = value;
    }
    return this;
  }

  // Validation
  validate() {
    this.flow.validate();
    return this;
  }

  // Build methods
  build() {
    if (this.router.routes.size > 0) {
      const routingModel = this.router.buildRoutingModel();
      this.flow.routing(routingModel);
    }

    return this.flow.build();
  }

  export(format = 'json') {
    const builtFlow = this.build();
    
    switch (format) {
      case 'json':
        return JSON.stringify(builtFlow, null, 2);
      case 'minified':
        return JSON.stringify(builtFlow);
      default:
        return builtFlow;
    }
  }

  preview(options = {}) {
    const PreviewGenerator = require('../preview/PreviewGenerator');
    const preview = new PreviewGenerator(this.build());
    
    if (options.serve) {
      preview.serve(options.port || 3000);
    }
    
    if (options.save) {
      return preview.saveToFile(options.save);
    }
    
    return preview.generateHTML();
  }

  // Static factory method for DSL
  static create(name, options = {}) {
    return new FlowBuilder(name, options);
  }

  // Enable DSL mode for cleaner syntax
  static enableDSL() {
    const builder = new FlowBuilder('temp');
    builder.dslMode = true;
    return builder;
  }
}

// Global DSL function
const createFlow = (name, options = {}) => new FlowBuilder(name, options);

module.exports = { FlowBuilder, createFlow };
