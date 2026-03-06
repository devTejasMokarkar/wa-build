const VERSION = process.env.WA_FLOW_VERSION || "7.3";
const Validator = require('./Validator');
const Compiler = require('./Compiler');

class Flow {
  constructor(name, options = {}) {
    this.name = name;
    this.version = options.version || "1.0.0";
    this.screens = [];
    this.routingModel = null;
    this.dataApiVersion = options.dataApiVersion || "3.0";
    this.validator = new Validator();
    this.compiler = new Compiler();
    
    this.flow = {
      version: VERSION,
      data_api_version: this.dataApiVersion,
      screens: []
    };

    this.currentScreen = null;
    this.currentForm = null;
    this.currentContainer = null;
  }

  screen(id, title, terminal = false) {
    if (!id) {
      throw new Error('Screen ID is required');
    }
    
    const screen = {
      id,
      title: title || id,
      terminal,
      layout: {
        type: "SingleColumnLayout",
        children: []
      }
    };

    this.flow.screens.push(screen);
    this.currentScreen = screen;
    this.currentContainer = screen.layout.children;

    return this;
  }

  routing(model) {
    if (!model || typeof model !== 'object') {
      throw new Error('Routing model must be a valid object');
    }
    
    this.flow.routing_model = model;
    this.routingModel = model;
    return this;
  }

  add(component) {
    if (!this.currentContainer) {
      throw new Error("No container available. Start with screen() or form()");
    }

    if (!component || typeof component !== 'object') {
      throw new Error("Component must be a valid object");
    }

    // Check EmbeddedLink limit
    const embeddedLinkCount = this.currentContainer.filter(c => c.type === 'EmbeddedLink').length;
    if (component.type === 'EmbeddedLink' && embeddedLinkCount >= 3) {
      throw new Error(`Screen ${this.currentScreen.id}: Maximum EmbeddedLink limit (3) reached`);
    }

    this.currentContainer.push(component);
    return this;
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
    const TextInput = require("../components/TextInput");
    const component = new TextInput(name, label, required, inputType);
    return this.add(component.build());
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
    const Dropdown = require("../components/Dropdown");
    const component = new Dropdown(name, label, dataSource);
    return this.add(component.build());
  }

  checkboxGroup(name, label, dataSource) {
    const CheckboxGroup = require("../components/CheckboxGroup");
    const component = new CheckboxGroup(name, label, dataSource);
    return this.add(component.build());
  }

  embeddedLink(text, action, options = {}) {
    const EmbeddedLink = require("../components/EmbeddedLink");
    const component = new EmbeddedLink(text, action, options);
    return this.add(component.build());
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
    const errors = this.validator.validateFlow(this.flow);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
    return this;
  }

  build() {
    if (this.flow.routing_model && Object.keys(this.flow.routing_model).length === 0) {
      delete this.flow.routing_model;
    }

    return this.compiler.compile(this.flow);
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
}

module.exports = Flow;
