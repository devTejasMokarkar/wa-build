const { VERSION, DATA_API_VERSION, COMPONENT_LIMITS, LAYOUT_TYPES, COMPONENT_TYPES } = require('./Constants');
const { ErrorHandler, ValidationError, ScreenError, ComponentError } = require('./ErrorHandler');

class Flow {
  constructor(name, options = {}) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Flow name is required and must be a string');
    }

    this.name = name;
    this.version = options.version || "1.0.0";
    this.dataApiVersion = options.dataApiVersion || DATA_API_VERSION;
    this.options = { ...options };

    this.flow = {
      version: VERSION,
      data_api_version: this.dataApiVersion,
      screens: []
    };

    this.currentScreen = null;
    this.currentForm = null;
    this.currentContainer = null;
    this.componentCounts = new Map();
  }

  screen(id, title, terminal = false) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Screen ID is required and must be a string');
    }

    if (id.length > 50) {
      throw new ValidationError('Screen ID cannot exceed 50 characters');
    }

    if (this.flow.screens.length >= COMPONENT_LIMITS.MAX_SCREENS_PER_FLOW) {
      throw new ScreenError(`Maximum screens per flow (${COMPONENT_LIMITS.MAX_SCREENS_PER_FLOW}) reached`, id);
    }

    // Check for duplicate screen IDs
    if (this.flow.screens.some(screen => screen.id === id)) {
      throw new ScreenError(`Screen with ID '${id}' already exists`, id);
    }

    const screen = {
      id,
      title: title || id,
      terminal,
      layout: {
        type: LAYOUT_TYPES.SINGLE_COLUMN,
        children: []
      }
    };

    this.flow.screens.push(screen);
    this.currentScreen = screen;
    this.currentContainer = screen.layout.children;
    this.currentForm = null;

    return this;
  }

  routing(model) {
    if (!model || typeof model !== 'object') {
      throw new ValidationError('Routing model must be a valid object');
    }

    this.flow.routing_model = model;
    return this;
  }

  add(component) {
    if (!this.currentContainer) {
      throw new ValidationError('No container available. Start with screen() or form()');
    }

    if (!component || typeof component !== 'object') {
      throw new ValidationError('Component must be a valid object');
    }

    // Check component limits
    this.checkComponentLimits(component);

    // Validate component if it has validation method
    if (component.validate && typeof component.validate === 'function') {
      const errors = component.validate();
      if (errors.length > 0) {
        throw new ComponentError(`Component validation failed: ${errors.join(', ')}`, component.type, component.name);
      }
    }

    this.currentContainer.push(component);
    return this;
  }

  checkComponentLimits(component) {
    const screenId = this.currentScreen.id;
    
    // Count components in current screen
    const currentCount = this.currentContainer.length;
    if (currentCount >= COMPONENT_LIMITS.MAX_COMPONENTS_PER_SCREEN) {
      throw new ComponentError(
        `Maximum components per screen (${COMPONENT_LIMITS.MAX_COMPONENTS_PER_SCREEN}) reached`,
        component.type,
        component.name
      );
    }

    // Check EmbeddedLink limit
    if (component.type === COMPONENT_TYPES.EMBEDDED_LINK) {
      const embeddedLinkCount = this.currentContainer.filter(c => c.type === COMPONENT_TYPES.EMBEDDED_LINK).length;
      if (embeddedLinkCount >= COMPONENT_LIMITS.EMBEDDED_LINKS_PER_SCREEN) {
        throw new ComponentError(
          `Maximum EmbeddedLink limit (${COMPONENT_LIMITS.EMBEDDED_LINKS_PER_SCREEN}) reached`,
          component.type,
          component.name
        );
      }
    }

    // Check form field limit
    if (this.currentForm && currentCount >= COMPONENT_LIMITS.MAX_FORM_FIELDS) {
      throw new ComponentError(
        `Maximum form fields (${COMPONENT_LIMITS.MAX_FORM_FIELDS}) reached`,
        component.type,
        component.name
      );
    }
  }

  form(name, initValues = {}) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Form name is required and must be a string');
    }

    if (!this.currentScreen) {
      throw new ValidationError('No active screen. Start with screen() before adding form');
    }

    const form = {
      type: COMPONENT_TYPES.FORM,
      name
    };

    if (Object.keys(initValues).length) {
      form["init-values"] = initValues;
    }

    form.children = [];
    this.currentScreen.layout.children.push(form);
    this.currentForm = form;
    this.currentContainer = form.children;

    return this;
  }

  // Component methods with lazy loading for better performance
  textInput(name, label, required = true, inputType = "text", options = {}) {
    const TextInput = require("../components/TextInput");
    const component = new TextInput(name, label, required, inputType, options);
    return this.add(component.build());
  }

  numberInput(name, label, options = {}) {
    return this.textInput(name, label, true, "number", options);
  }

  emailInput(name, label, options = {}) {
    return this.textInput(name, label, true, "email", options);
  }

  passwordInput(name, label, options = {}) {
    return this.textInput(name, label, true, "password", options);
  }

  phoneInput(name, label, options = {}) {
    return this.textInput(name, label, true, "phone", options);
  }

  dropdown(name, label, dataSource, options = {}) {
    const Dropdown = require("../components/Dropdown");
    const component = new Dropdown(name, label, dataSource, options);
    return this.add(component.build());
  }

  checkboxGroup(name, label, dataSource, options = {}) {
    const CheckboxGroup = require("../components/CheckboxGroup");
    const component = new CheckboxGroup(name, label, dataSource, options);
    return this.add(component.build());
  }

  embeddedLink(text, action, options = {}) {
    const EmbeddedLink = require("../components/EmbeddedLink");
    const component = new EmbeddedLink(text, action, options);
    return this.add(component.build());
  }

  textBody(text, options = {}) {
    const TextBody = require("../components/TextBody");
    const component = new TextBody(text, options);
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
    if (!this.flow.routing_model) {
      this.routing({});
    }
    
    this.flow.routing_model[condition] = {
      true: trueScreen,
      false: falseScreen
    };
    
    return this;
  }

  validate() {
    const errors = [];

    // Check if flow has screens
    if (this.flow.screens.length === 0) {
      errors.push('Flow must have at least one screen');
    }

    // Validate each screen
    this.flow.screens.forEach((screen, index) => {
      if (!screen.id) {
        errors.push(`Screen ${index} is missing ID`);
      }
      
      if (!screen.layout || !screen.layout.children) {
        errors.push(`Screen ${screen.id} has invalid layout`);
      }
    });

    if (errors.length > 0) {
      throw new ValidationError(`Flow validation failed: ${errors.join(', ')}`);
    }

    return this;
  }

  build() {
    // Clean up empty routing model
    if (this.flow.routing_model && Object.keys(this.flow.routing_model).length === 0) {
      delete this.flow.routing_model;
    }

    // Validate before building
    this.validate();

    return this.flow;
  }

  export(format = 'json') {
    const builtFlow = this.build();
    
    switch (format) {
      case 'json':
        return JSON.stringify(builtFlow, null, 2);
      case 'minified':
        return JSON.stringify(builtFlow);
      case 'object':
        return builtFlow;
      default:
        throw new ValidationError(`Unsupported export format: ${format}`);
    }
  }

  // Production utilities
  getStats() {
    return {
      name: this.name,
      version: this.version,
      screens: this.flow.screens.length,
      totalComponents: this.flow.screens.reduce((total, screen) => 
        total + (screen.layout?.children?.length || 0), 0
      ),
      hasRouting: !!this.flow.routing_model,
      terminalScreens: this.flow.screens.filter(screen => screen.terminal).length
    };
  }

  clone() {
    const cloned = new Flow(this.name + '_clone', this.options);
    cloned.flow = JSON.parse(JSON.stringify(this.flow));
    return cloned;
  }
}

module.exports = Flow;
