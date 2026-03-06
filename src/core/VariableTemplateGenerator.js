/**
 * Variable Template Generator - Dynamic Flow Creation
 * Automatically generates variable naming conventions and data structures
 */

class VariableTemplateGenerator {
  constructor() {
    this.variableTemplates = new Map();
    this.dataDefinitions = new Map();
  }

  /**
   * Generate variable names based on base name
   * Pattern: L{Base}, dataSource{Base}, V{Base}, R{Base}
   */
  generateVariableNames(baseName) {
    const templates = {
      // Label variable - for display text
      label: `L${baseName}`,
      
      // Data source variable - for dropdown/radio options
      dataSource: `dataSource${baseName}`,
      
      // Visibility variable - for showing/hiding components
      visibility: `V${baseName}`,
      
      // Required variable - for validation
      required: `R${baseName}`,
      
      // Output variable - for form field name
      output: `O${baseName}`
    };

    return templates;
  }

  /**
   * Generate data structure for a variable
   */
  generateDataStructure(baseName, config = {}) {
    const {
      label = `${baseName}`,
      type = 'string',
      example = '',
      required = false,
      visible = false,
      dataSource = []
    } = config;

    const variables = this.generateVariableNames(baseName);
    
    const dataStructure = {
      // Label definition
      [variables.label]: {
        type: type,
        "__example__": example || label
      },
      
      // Data source definition (for dropdowns/radios)
      [variables.dataSource]: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            metadata: { type: "string" },
            enabled: { type: "boolean" },
            type: { type: "string" }
          }
        },
        "__example__": dataSource
      },
      
      // Required flag
      [variables.required]: {
        type: "boolean",
        "__example__": required
      },
      
      // Visibility flag
      [variables.visibility]: {
        type: "boolean",
        "__example__": visible
      }
    };

    return dataStructure;
  }

  /**
   * Generate component JSON with variable binding
   */
  generateComponent(baseName, componentType, config = {}) {
    const variables = this.generateVariableNames(baseName);
    
    switch (componentType) {
      case 'RadioButtonsGroup':
        return this.generateRadioButtonsGroup(variables, config);
      case 'Dropdown':
        return this.generateDropdown(variables, config);
      case 'TextInput':
        return this.generateTextInput(variables, config);
      case 'CheckboxGroup':
        return this.generateCheckboxGroup(variables, config);
      default:
        console.warn(`Unsupported component type: ${componentType}, using default RadioButtonsGroup`);
        return this.generateRadioButtonsGroup(variables, config);
    }
  }

  /**
   * Generate RadioButtonsGroup component
   */
  generateRadioButtonsGroup(variables, config = {}) {
    const {
      required = true,
      visible = true,
      onSelectAction = null,
      payload = {}
    } = config;

    return {
      label: `\${data.${variables.label}}`,
      name: variables.output,
      "data-source": `\${data.${variables.dataSource}}`,
      required: `\${data.${variables.required}}`,
      visible: `\${data.${variables.visibility}}`,
      type: "RadioButtonsGroup",
      ...(onSelectAction && {
        "on-select-action": {
          name: "data_exchange",
          payload: {
            [variables.output]: `\${form.${variables.output}}`,
            onSelectAction,
            ...payload
          }
        }
      })
    };
  }

  /**
   * Generate Dropdown component
   */
  generateDropdown(variables, config = {}) {
    const {
      required = true,
      visible = true,
      onSelectAction = null,
      payload = {}
    } = config;

    return {
      label: `\${data.${variables.label}}`,
      name: variables.output,
      "data-source": `\${data.${variables.dataSource}}`,
      required: `\${data.${variables.required}}`,
      visible: `\${data.${variables.visibility}}`,
      type: "Dropdown",
      ...(onSelectAction && {
        "on-select-action": {
          name: "data_exchange",
          payload: {
            [variables.output]: `\${form.${variables.output}}`,
            onSelectAction,
            ...payload
          }
        }
      })
    };
  }

  /**
   * Generate TextInput component
   */
  generateTextInput(variables, config = {}) {
    const {
      required = true,
      visible = true,
      inputType = 'text',
      minChars = null,
      maxChars = null,
      helperText = null
    } = config;

    const component = {
      label: `\${data.${variables.label}}`,
      name: variables.output,
      required: `\${data.${variables.required}}`,
      visible: `\${data.${variables.visibility}}`,
      type: "TextInput",
      "input-type": inputType
    };

    if (minChars) component["min-chars"] = minChars;
    if (maxChars) component["max-chars"] = maxChars;
    if (helperText) component["helper-text"] = `\${data.${variables.label}Helper}`;

    return component;
  }

  /**
   * Generate CheckboxGroup component
   */
  generateCheckboxGroup(variables, config = {}) {
    const {
      required = true,
      visible = true,
      onSelectAction = null,
      payload = {}
    } = config;

    return {
      label: `\${data.${variables.label}}`,
      name: variables.output,
      "data-source": `\${data.${variables.dataSource}}`,
      required: `\${data.${variables.required}}`,
      visible: `\${data.${variables.visibility}}`,
      type: "CheckboxGroup",
      ...(onSelectAction && {
        "on-select-action": {
          name: "data_exchange",
          payload: {
            [variables.output]: `\${form.${variables.output}}`,
            onSelectAction,
            ...payload
          }
        }
      })
    };
  }

  /**
   * Generate Switch component for conditional logic
   */
  generateSwitch(value, cases, config = {}) {
    return {
      type: "Switch",
      value: value,
      cases: cases,
      ...config
    };
  }

  /**
   * Register a variable template
   */
  registerTemplate(name, config) {
    this.variableTemplates.set(name, {
      dataStructure: this.generateDataStructure(name, config),
      component: this.generateComponent(name, config.componentType, config.componentConfig)
    });
    
    return this;
  }

  /**
   * Get template by name
   */
  getTemplate(name) {
    return this.variableTemplates.get(name);
  }

  /**
   * Generate complete flow data structure
   */
  generateFlowData(variables) {
    const flowData = {};
    
    variables.forEach(variableConfig => {
      const { name, config } = variableConfig;
      const dataStructure = this.generateDataStructure(name, config);
      
      Object.assign(flowData, dataStructure);
    });
    
    return flowData;
  }

  /**
   * Generate screen with dynamic components
   */
  generateScreen(id, title, variables, config = {}) {
    const screenData = this.generateFlowData(variables);
    const components = variables.map(variableConfig => {
      const { name, config: varConfig } = variableConfig;
      return this.generateComponent(name, varConfig.componentType, varConfig.componentConfig);
    });

    return {
      id,
      title,
      data: screenData,
      layout: {
        type: "SingleColumnLayout",
        children: components
      },
      ...config
    };
  }

  /**
   * Parse variable name from user input
   * Extracts base name from patterns like "ApplicantChoice" -> "ApplicantChoice"
   */
  parseVariableName(input) {
    // Remove common prefixes and clean up
    const cleaned = input
      .replace(/^(L|dataSource|V|R|O)/, '') // Remove prefixes
      .replace(/[^a-zA-Z0-9]/g, '')        // Remove special chars
      .trim();
    
    // Capitalize first letter of each word
    return cleaned
      .split(/(?=[A-Z])/) // Split on capital letters
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Create dynamic flow builder
   */
  createDynamicBuilder() {
    return new DynamicFlowBuilder(this);
  }
}

/**
 * Enhanced Dynamic Flow Builder with Variable Templates
 */
class DynamicFlowBuilder {
  constructor(variableGenerator) {
    this.variableGenerator = variableGenerator;
    this.screens = [];
    this.routingModel = {};
    this.globalData = {};
  }

  /**
   * Add screen with dynamic variables
   */
  addScreen(id, title, variables = [], config = {}) {
    const screen = this.variableGenerator.generateScreen(id, title, variables, config);
    this.screens.push(screen);
    return this;
  }

  /**
   * Add variable to current screen
   */
  addVariable(baseName, componentType, config = {}) {
    if (this.screens.length === 0) {
      throw new Error('Add a screen first before adding variables');
    }

    const currentScreen = this.screens[this.screens.length - 1];
    const variables = this.variableGenerator.generateVariableNames(baseName);
    const dataStructure = this.variableGenerator.generateDataStructure(baseName, config);
    const component = this.variableGenerator.generateComponent(baseName, componentType, config.componentConfig);

    // Add data structure to screen data
    Object.assign(currentScreen.data, dataStructure);

    // Add component to screen layout
    currentScreen.layout.children.push(component);

    return this;
  }

  /**
   * Add routing between screens
   */
  addRouting(fromScreen, toScreens) {
    this.routingModel[fromScreen] = Array.isArray(toScreens) ? toScreens : [toScreens];
    return this;
  }

  /**
   * Build complete flow
   */
  build() {
    return {
      version: "7.0",
      data_api_version: "3.0",
      routing_model: this.routingModel,
      screens: this.screens
    };
  }

  /**
   * Export flow with pretty formatting
   */
  export() {
    return JSON.stringify(this.build(), null, 2);
  }
}

module.exports = {
  VariableTemplateGenerator,
  DynamicFlowBuilder
};
