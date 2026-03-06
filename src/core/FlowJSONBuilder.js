const { VERSION, DATA_API_VERSION } = require('./Constants');
const { ErrorHandler, ValidationError } = require('./ErrorHandler');

/**
 * FlowJSONBuilder - Creates flows in the exact JSON format specified
 * Supports both static data and dynamic data binding
 */
class FlowJSONBuilder {
  constructor(version = "7.0", dataApiVersion = "3.0") {
    this.flow = {
      version,
      routing_model: {},
      data_api_version: dataApiVersion,
      screens: []
    };
  }

  /**
   * Set routing model with screen navigation
   */
  routing(routingModel) {
    this.flow.routing_model = routingModel;
    return this;
  }

  /**
   * Add a screen with data and layout
   */
  screen(id, title, data = {}, terminal = false, success = false) {
    const screen = {
      id,
      title,
      data: this.processData(data),
      layout: {
        type: "SingleColumnLayout",
        children: []
      }
    };

    if (terminal) screen.terminal = terminal;
    if (success) screen.success = success;

    this.flow.screens.push(screen);
    this.currentScreen = screen;
    return this;
  }

  /**
   * Process data to support dynamic binding
   */
  processData(data) {
    const processed = {};
    
    for (const [key, value] of Object.entries(data)) {
      processed[key] = {
        type: this.inferType(value),
        __example__: this.generateExample(value),
        ...value
      };
    }
    
    return processed;
  }

  /**
   * Infer data type from value
   */
  inferType(value) {
    if (Array.isArray(value)) return "array";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    return "string";
  }

  /**
   * Generate example value
   */
  generateExample(value) {
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : "";
    }
    if (typeof value === "boolean") return false;
    if (typeof value === "number") return 0;
    return value;
  }

  /**
   * Add component to current screen
   */
  addComponent(component) {
    if (!this.currentScreen) {
      throw new ValidationError("No active screen. Call screen() first");
    }
    
    this.currentScreen.layout.children.push(component);
    return this;
  }

  /**
   * Add Image component
   */
  image(width = 400, height = 100, options = {}) {
    return this.addComponent({
      type: "Image",
      width,
      height,
      ...options
    });
  }

  /**
   * Add TextSubheading component
   */
  textSubheading(text, options = {}) {
    return this.addComponent({
      type: "TextSubheading",
      text: this.processTextBinding(text),
      ...options
    });
  }

  /**
   * Add TextHeading component
   */
  textHeading(text, options = {}) {
    return this.addComponent({
      type: "TextHeading",
      text: this.processTextBinding(text),
      ...options
    });
  }

  /**
   * Add TextBody component
   */
  textBody(text, markdown = false, options = {}) {
    return this.addComponent({
      type: "TextBody",
      text: this.processTextBinding(text),
      markdown,
      ...options
    });
  }

  /**
   * Add TextInput component
   */
  textInput(name, label, required = true, options = {}) {
    return this.addComponent({
      type: "TextInput",
      name,
      label: this.processTextBinding(label),
      required,
      ...options
    });
  }

  /**
   * Add Dropdown component
   */
  dropdown(name, label, dataSource, required = true, options = {}) {
    return this.addComponent({
      type: "Dropdown",
      name,
      label: this.processTextBinding(label),
      "data-source": this.processTextBinding(dataSource),
      required,
      ...options
    });
  }

  /**
   * Add RadioButtonsGroup component
   */
  radioButtonsGroup(name, label, dataSource, required = true, options = {}) {
    return this.addComponent({
      type: "RadioButtonsGroup",
      name,
      label: this.processTextBinding(label),
      "data-source": this.processTextBinding(dataSource),
      required,
      ...options
    });
  }

  /**
   * Add Switch component for conditional rendering
   */
  switchComponent(value, cases, options = {}) {
    return this.addComponent({
      type: "Switch",
      value: this.processTextBinding(value),
      cases: this.processCases(cases),
      ...options
    });
  }

  /**
   * Process switch cases
   */
  processCases(cases) {
    const processed = {};
    
    for (const [caseKey, caseComponents] of Object.entries(cases)) {
      processed[caseKey] = caseComponents.map(comp => this.processComponent(comp));
    }
    
    return processed;
  }

  /**
   * Process individual component
   */
  processComponent(component) {
    const processed = { ...component };
    
    // Process text bindings
    if (processed.text) {
      processed.text = this.processTextBinding(processed.text);
    }
    if (processed.label) {
      processed.label = this.processTextBinding(processed.label);
    }
    
    // Process data source bindings
    if (processed["data-source"]) {
      processed["data-source"] = this.processTextBinding(processed["data-source"]);
    }
    
    // Process visibility
    if (processed.visible) {
      processed.visible = this.processTextBinding(processed.visible);
    }
    
    // Process enabled
    if (processed.enabled) {
      processed.enabled = this.processTextBinding(processed.enabled);
    }
    
    return processed;
  }

  /**
   * Add EmbeddedLink component
   */
  embeddedLink(text, action, payload = {}, options = {}) {
    return this.addComponent({
      type: "EmbeddedLink",
      text: this.processTextBinding(text),
      "on-click-action": {
        name: action,
        payload: this.processPayload(payload)
      },
      ...options
    });
  }

  /**
   * Add Footer component
   */
  footer(label, action = "complete", payload = {}, options = {}) {
    return this.addComponent({
      type: "Footer",
      label: this.processTextBinding(label),
      "on-click-action": {
        name: action,
        payload: this.processPayload(payload)
      },
      ...options
    });
  }

  /**
   * Process payload with text bindings
   */
  processPayload(payload) {
    const processed = {};
    
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "string") {
        processed[key] = this.processTextBinding(value);
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  }

  /**
   * Process text binding with ${} syntax
   */
  processTextBinding(text) {
    if (typeof text !== "string") return text;
    
    // Check if it's already a binding
    if (text.startsWith("${") && text.endsWith("}")) {
      return text;
    }
    
    // Convert to binding if needed
    return text;
  }

  /**
   * Add on-select-action to last component
   */
  addOnSelectAction(action, payload = {}) {
    if (!this.currentScreen || this.currentScreen.layout.children.length === 0) {
      throw new ValidationError("No component found to add action to");
    }
    
    const lastComponent = this.currentScreen.layout.children[this.currentScreen.layout.children.length - 1];
    lastComponent["on-select-action"] = {
      name: action,
      payload: this.processPayload(payload)
    };
    
    return this;
  }

  /**
   * Build the flow JSON
   */
  build() {
    return ErrorHandler.wrap(() => {
      // Validate flow structure
      this.validate();
      
      return JSON.parse(JSON.stringify(this.flow));
    }, { context: 'FlowJSONBuilder.build' });
  }

  /**
   * Export as JSON string
   */
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

  /**
   * Validate flow structure
   */
  validate() {
    const errors = [];
    
    if (!this.flow.screens || this.flow.screens.length === 0) {
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
      
      // Validate components
      screen.layout.children.forEach((component, compIndex) => {
        if (!component.type) {
          errors.push(`Component ${compIndex} in screen ${screen.id} is missing type`);
        }
      });
    });
    
    if (errors.length > 0) {
      throw new ValidationError(`Flow validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Create flow from existing JSON structure
   */
  static fromJSON(jsonFlow) {
    const builder = new FlowJSONBuilder(jsonFlow.version, jsonFlow.data_api_version);
    
    builder.flow = JSON.parse(JSON.stringify(jsonFlow));
    
    return builder;
  }

  /**
   * Quick factory method for common patterns
   */
  static createWelcomeServiceFlow(data = {}) {
    const builder = new FlowJSONBuilder();
    
    return builder
      .routing({
        "WELCOME": ["SERVICES", "CHECK_APPLICATION_STATUS"],
        "SERVICES": ["CHECK_APPLICATION_STATUS"],
        "CHECK_APPLICATION_STATUS": []
      })
      .screen("WELCOME", "Welcome", {
        screenDescription: { type: "string", ...data.screenDescription },
        LSearch: { type: "string", ...data.LSearch },
        HelperSearch: { type: "string", ...data.HelperSearch },
        LabelKeywords: { type: "string", ...data.LabelKeywords },
        LabelKeywordsText: { type: "string", ...data.LabelKeywordsText },
        LabelDepartmentText: { type: "string", ...data.LabelDepartmentText },
        LabelDepartment: { type: "string", ...data.LabelDepartment },
        LabelSearch: { type: "string", ...data.LabelSearch },
        embeddedLabel: { type: "string", ...data.embeddedLabel },
        LDepartment: { type: "string", ...data.LDepartment },
        departmentList: { type: "array", ...data.departmentList },
        LFooter: { type: "string", ...data.LFooter },
        isFooterEnabled: { type: "boolean", ...data.isFooterEnabled },
        LServiceList: { type: "string", ...data.LServiceList },
        fuzzyServiceList: { type: "array", ...data.fuzzyServiceList },
        RServiceList: { type: "boolean", ...data.RServiceList },
        VServiceList: { type: "boolean", ...data.VServiceList },
        extraDetails: { type: "string", ...data.extraDetails },
        LApplicantChoiceToProceed: { type: "string", ...data.LApplicantChoiceToProceed },
        dataSourceApplicantChoice: { type: "array", ...data.dataSourceApplicantChoice },
        VApplicantChoice: { type: "boolean", ...data.VApplicantChoice }
      }, true, true)
      .image(400, 100)
      .textSubheading("${data.screenDescription}")
      .radioButtonsGroup("OSearchBy", "${data.LabelSearch}", [
        {
          id: "service",
          title: "${data.LabelKeywords}",
          description: "${data.LabelKeywordsText}"
        },
        {
          id: "department",
          title: "${data.LabelDepartment}",
          description: "${data.LabelDepartmentText}"
        }
      ], true, { "init-value": "service" })
      .switchComponent("${form.OSearchBy}", {
        service: [
          {
            type: "TextInput",
            label: "${data.LSearch}",
            name: "OSearch",
            "min-chars": 3,
            "helper-text": "${data.HelperSearch}",
            required: true
          },
          {
            type: "EmbeddedLink",
            text: "${data.embeddedLabel}",
            "on-click-action": {
              name: "data_exchange",
              payload: {
                OSearch: "${form.OSearch}",
                OService: "${form.OService}",
                OSelectDepartment: "${form.OSelectDepartment}",
                onSelectAction: "search-clicked",
                extraDetails: "${data.extraDetails}"
              }
            }
          },
          {
            type: "Dropdown",
            label: "${data.LServiceList}",
            name: "OService",
            "data-source": "${data.fuzzyServiceList}",
            required: true,
            visible: "${data.VServiceList}",
            "on-select-action": {
              name: "data_exchange",
              payload: {
                OSearch: "${form.OSearch}",
                OService: "${form.OService}",
                OSelectDepartment: "${form.OSelectDepartment}",
                onSelectAction: "search-service-selected",
                extraDetails: "${data.extraDetails}"
              }
            }
          }
        ],
        department: [
          {
            type: "RadioButtonsGroup",
            label: "${data.LDepartment}",
            name: "OSelectDepartment",
            "data-source": "${data.departmentList}",
            required: true,
            "on-select-action": {
              name: "data_exchange",
              payload: {
                OSearch: "${form.OSearch}",
                OService: "${form.OService}",
                OSelectDepartment: "${form.OSelectDepartment}",
                onSelectAction: "service-selected",
                extraDetails: "${data.extraDetails}"
              }
            }
          }
        ]
      })
      .radioButtonsGroup("OApplicantChoiceToProceed", "${data.LApplicantChoiceToProceed}", "${data.dataSourceApplicantChoice}", "${data.VApplicantChoice}", {
        visible: "${data.VApplicantChoice}"
      })
      .footer("${data.LFooter}", "data_exchange", {
        OSearch: "${form.OSearch}",
        OService: "${form.OService}",
        OSelectDepartment: "${form.OSelectDepartment}",
        extraDetails: "${data.extraDetails}",
        onSelectAction: "footer-selected",
        OSearchBy: "${form.OSearchBy}",
        OApplicantChoiceToProceed: "${form.OApplicantChoiceToProceed}"
      }, { enabled: "${data.isFooterEnabled}" });
  }
}

module.exports = FlowJSONBuilder;
