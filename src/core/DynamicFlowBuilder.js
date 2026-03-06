const FlowJSONBuilder = require('./FlowJSONBuilder');
const { ErrorHandler } = require('./ErrorHandler');

/**
 * DynamicFlowBuilder - Combines both DSL and JSON approaches
 * Supports both static building and dynamic data binding
 */
class DynamicFlowBuilder {
  constructor(mode = 'json', options = {}) {
    this.mode = mode; // 'json' or 'dsl'
    this.options = options;
    
    if (mode === 'json') {
      this.builder = new FlowJSONBuilder(options.version, options.dataApiVersion);
    } else {
      // Use existing FlowBuilder for DSL mode
      const { FlowBuilder } = require('./FlowBuilder');
      this.builder = new FlowBuilder(options.name, options);
    }
  }

  /**
   * Create flow with both static and dynamic capabilities
   */
  static create(name, options = {}) {
    return new DynamicFlowBuilder('json', { name, ...options });
  }

  /**
   * Create from existing JSON structure
   */
  static fromJSON(jsonFlow) {
    const builder = new DynamicFlowBuilder('json');
    builder.builder = FlowJSONBuilder.fromJSON(jsonFlow);
    return builder;
  }

  /**
   * Create from DSL flow
   */
  static fromDSL(dslFlow) {
    const builder = new DynamicFlowBuilder('dsl');
    builder.builder = dslFlow;
    return builder;
  }

  /**
   * Add screen with dynamic data support
   */
  screen(id, title, data = {}, options = {}) {
    if (this.mode === 'json') {
      this.builder.screen(id, title, data, options.terminal, options.success);
    } else {
      this.builder.screen(id, title, options.terminal);
      
      // Add data binding to DSL flow
      if (!this.builder.flow.data) {
        this.builder.flow.data = {};
      }
      this.builder.flow.data[id] = data;
    }
    
    return this;
  }

  /**
   * Add component with dynamic binding support
   */
  addComponent(component) {
    if (this.mode === 'json') {
      this.builder.addComponent(component);
    } else {
      this.builder.add(component);
    }
    
    return this;
  }

  /**
   * Add image component
   */
  image(width = 400, height = 100, options = {}) {
    if (this.mode === 'json') {
      this.builder.image(width, height, options);
    } else {
      // DSL doesn't have native image, add as custom component
      this.addComponent({
        type: 'Image',
        width,
        height,
        ...options
      });
    }
    
    return this;
  }

  /**
   * Add text component
   */
  text(text, type = 'TextBody', options = {}) {
    if (this.mode === 'json') {
      switch (type) {
        case 'TextSubheading':
          this.builder.textSubheading(text, options);
          break;
        case 'TextHeading':
          this.builder.textHeading(text, options);
          break;
        default:
          this.builder.textBody(text, options.markdown || false, options);
      }
    } else {
      if (type === 'TextBody') {
        this.builder.textBody(text, options);
      } else {
        // Custom component for other text types
        this.addComponent({
          type,
          text,
          ...options
        });
      }
    }
    
    return this;
  }

  /**
   * Add input component
   */
  input(name, label, inputType = 'text', options = {}) {
    if (this.mode === 'json') {
      switch (inputType) {
        case 'dropdown':
          this.builder.dropdown(name, label, options.dataSource || [], options.required, options);
          break;
        case 'radio':
          this.builder.radioButtonsGroup(name, label, options.dataSource || [], options.required, options);
          break;
        default:
          this.builder.textInput(name, label, options.required !== false, { 
            inputType, 
            ...options 
          });
      }
    } else {
      switch (inputType) {
        case 'dropdown':
          this.builder.dropdown(name, label, options.dataSource || [], options);
          break;
        case 'radio':
          this.builder.checkboxGroup(name, label, options.dataSource || [], options);
          break;
        default:
          this.builder.textInput(name, label, options.required !== false, inputType, options);
      }
    }
    
    return this;
  }

  /**
   * Add switch component for conditional logic
   */
  switch(value, cases, options = {}) {
    if (this.mode === 'json') {
      this.builder.switchComponent(value, cases, options);
    } else {
      // DSL doesn't have native switch, add as custom component
      this.addComponent({
        type: 'Switch',
        value,
        cases,
        ...options
      });
    }
    
    return this;
  }

  /**
   * Add embedded link
   */
  link(text, action, payload = {}, options = {}) {
    if (this.mode === 'json') {
      this.builder.embeddedLink(text, action, payload, options);
    } else {
      this.builder.embeddedLink(text, action, options);
    }
    
    return this;
  }

  /**
   * Add footer
   */
  footer(label, action = 'complete', payload = {}, options = {}) {
    if (this.mode === 'json') {
      this.builder.footer(label, action, payload, options);
    } else {
      this.builder.footer(label, action, options.next);
    }
    
    return this;
  }

  /**
   * Set routing model
   */
  routing(routingModel) {
    if (this.mode === 'json') {
      this.builder.routing(routingModel);
    } else {
      this.builder.routing(routingModel);
    }
    
    return this;
  }

  /**
   * Build flow in specified format
   */
  build(format = 'json') {
    if (this.mode === 'json') {
      return this.builder.build();
    } else {
      // Convert DSL to JSON format if needed
      if (format === 'json') {
        return this.convertDSLToJSON();
      }
      return this.builder.build();
    }
  }

  /**
   * Convert DSL flow to JSON format
   */
  convertDSLToJSON() {
    const dslFlow = this.builder.build();
    
    return {
      version: dslFlow.version || "7.0",
      routing_model: dslFlow.routing_model || {},
      data_api_version: dslFlow.data_api_version || "3.0",
      screens: dslFlow.screens.map(screen => this.convertScreenToJSON(screen))
    };
  }

  /**
   * Convert DSL screen to JSON format
   */
  convertScreenToJSON(screen) {
    const jsonScreen = {
      id: screen.id,
      title: screen.title,
      data: this.builder.flow.data?.[screen.id] || {},
      layout: {
        type: screen.layout?.type || "SingleColumnLayout",
        children: screen.layout?.children || []
      }
    };

    if (screen.terminal) jsonScreen.terminal = screen.terminal;
    if (screen.success) jsonScreen.success = screen.success;

    return jsonScreen;
  }

  /**
   * Export in specified format
   */
  export(format = 'json') {
    if (this.mode === 'json') {
      return this.builder.export(format);
    } else {
      const flow = this.build(format);
      return typeof flow === 'string' ? flow : JSON.stringify(flow, null, 2);
    }
  }

  /**
   * Validate flow
   */
  validate() {
    if (this.mode === 'json') {
      return this.builder.validate();
    } else {
      // DSL validation
      const flow = this.builder.build();
      const errors = [];
      
      if (!flow.screens || flow.screens.length === 0) {
        errors.push('Flow must have at least one screen');
      }
      
      return { valid: errors.length === 0, errors };
    }
  }

  /**
   * Get flow statistics
   */
  getStats() {
    const flow = this.build();
    
    return {
      mode: this.mode,
      version: flow.version,
      screens: flow.screens?.length || 0,
      totalComponents: flow.screens?.reduce((total, screen) => 
        total + (screen.layout?.children?.length || 0), 0
      ) || 0,
      hasRouting: !!(flow.routing_model && Object.keys(flow.routing_model).length > 0),
      hasData: !!(flow.data && Object.keys(flow.data).length > 0)
    };
  }

  /**
   * Clone the builder
   */
  clone() {
    const cloned = new DynamicFlowBuilder(this.mode, this.options);
    
    if (this.mode === 'json') {
      cloned.builder = FlowJSONBuilder.fromJSON(this.builder.build());
    } else {
      cloned.builder = this.builder.clone();
    }
    
    return cloned;
  }

  /**
   * Convert between modes
   */
  convertTo(newMode) {
    if (newMode === this.mode) {
      return this;
    }
    
    const flow = this.build();
    const converted = new DynamicFlowBuilder(newMode, this.options);
    
    if (newMode === 'json') {
      converted.builder = FlowJSONBuilder.fromJSON(flow);
    } else {
      // Convert JSON to DSL (simplified)
      const { FlowBuilder } = require('./FlowBuilder');
      converted.builder = new FlowBuilder(this.options.name, this.options);
      
      // Add screens and components
      flow.screens?.forEach(screen => {
        converted.builder.screen(screen.id, screen.title, screen.terminal);
        
        screen.layout?.children?.forEach(component => {
          converted.builder.add(component);
        });
      });
    }
    
    return converted;
  }
}

module.exports = DynamicFlowBuilder;
