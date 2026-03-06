const Ajv = require("ajv");

class Validator {
  constructor() {
    try {
      this.ajv = new Ajv({ allErrors: true });
      // Try to add formats if available
      try {
        const addFormats = require("ajv-formats");
        addFormats(this.ajv);
      } catch (e) {
        // ajv-formats not available, continue without it
        console.warn('ajv-formats not available, some validations may be limited');
      }
    } catch (error) {
      console.error('Failed to initialize AJV validator:', error.message);
      this.ajv = null;
    }
    
    this.flowSchema = {
      type: "object",
      required: ["version", "data_api_version", "screens"],
      properties: {
        version: { type: "string", pattern: "^\\d+\\.\\d+$" },
        data_api_version: { type: "string", pattern: "^\\d+\\.\\d+$" },
        screens: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["id", "layout"],
            properties: {
              id: { type: "string", minLength: 1 },
              title: { type: "string" },
              terminal: { type: "boolean" },
              layout: {
                type: "object",
                required: ["type", "children"],
                properties: {
                  type: { type: "string" },
                  children: {
                    type: "array",
                    items: { type: "object" }
                  }
                }
              }
            }
          }
        },
        routing_model: { type: "object" }
      }
    };

    this.validate = this.ajv ? this.ajv.compile(this.flowSchema) : null;
  }

  validateFlow(flow) {
    const errors = [];
    
    // Basic structure validation
    if (!flow || typeof flow !== 'object') {
      errors.push('Flow must be a valid object');
      return errors;
    }

    // Required fields
    if (!flow.version) errors.push('Flow version is required');
    if (!flow.data_api_version) errors.push('Flow data_api_version is required');
    if (!flow.screens || !Array.isArray(flow.screens)) {
      errors.push('Flow screens array is required');
    } else if (flow.screens.length === 0) {
      errors.push('Flow must have at least one screen');
    }

    // AJV validation if available
    if (this.validate && !this.validate(flow)) {
      errors.push(...this.validate.errors.map(err => 
        `${err.instancePath || 'root'}: ${err.message}`
      ));
    }

    // Custom validations
    this.validateScreenIds(flow.screens, errors);
    this.validateComponents(flow.screens, errors);
    this.validateRouting(flow, errors);

    return errors;
  }

  validateScreenIds(screens, errors) {
    if (!screens || !Array.isArray(screens)) return;
    
    const screenIds = screens.map(s => s.id);
    const duplicates = screenIds.filter((id, index) => screenIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate screen IDs: ${duplicates.join(', ')}`);
    }
  }

  validateComponents(screens, errors) {
    if (!screens || !Array.isArray(screens)) return;
    
    screens.forEach(screen => {
      if (screen.layout && screen.layout.children) {
        const embeddedLinks = [];
        
        screen.layout.children.forEach((component, index) => {
          if (!component.type) {
            errors.push(`Screen ${screen.id}: Component at index ${index} missing type`);
          }
          
          // Count EmbeddedLinks
          if (component.type === 'EmbeddedLink') {
            embeddedLinks.push({ component, index });
          }
          
          if (component.type === 'TextInput' && !component.name) {
            errors.push(`Screen ${screen.id}: TextInput missing name`);
          }
          
          if (component.type === 'Dropdown' && !component['data-source']) {
            errors.push(`Screen ${screen.id}: Dropdown missing data-source`);
          }
        });
        
        // Validate EmbeddedLink count (max 3 per screen)
        if (embeddedLinks.length > 3) {
          errors.push(`Screen ${screen.id}: Too many EmbeddedLinks (${embeddedLinks.length}). Maximum allowed is 3`);
        }
        
        // Validate each EmbeddedLink
        embeddedLinks.forEach(({ component, index }) => {
          if (!component.text) {
            errors.push(`Screen ${screen.id}: EmbeddedLink at index ${index} missing text`);
          }
          if (!component['on-click-action']) {
            errors.push(`Screen ${screen.id}: EmbeddedLink at index ${index} missing on-click-action`);
          }
        });
      }
    });
  }

  validateRouting(flow, errors) {
    if (flow.routing_model && flow.screens) {
      const screenIds = flow.screens.map(s => s.id);
      
      Object.entries(flow.routing_model).forEach(([condition, routes]) => {
        if (routes.true && !screenIds.includes(routes.true)) {
          errors.push(`Routing condition "${condition}": Screen "${routes.true}" not found`);
        }
        if (routes.false && !screenIds.includes(routes.false)) {
          errors.push(`Routing condition "${condition}": Screen "${routes.false}" not found`);
        }
      });
    }
  }

  validateComponent(component) {
    const errors = [];
    
    if (!component || typeof component !== 'object') {
      errors.push('Component must be a valid object');
      return errors;
    }

    if (!component.type) {
      errors.push('Component type is required');
      return errors;
    }

    const componentSchemas = {
      TextInput: {
        type: "object",
        required: ["type", "name", "label"],
        properties: {
          type: { const: "TextInput" },
          name: { type: "string", minLength: 1 },
          label: { type: "string", minLength: 1 },
          required: { type: "boolean" },
          "input-type": { type: "string" }
        }
      },
      Dropdown: {
        type: "object",
        required: ["type", "name", "label", "data-source"],
        properties: {
          type: { const: "Dropdown" },
          name: { type: "string", minLength: 1 },
          label: { type: "string", minLength: 1 },
          "data-source": {
            type: "array",
            items: {
              type: "object",
              required: ["id", "title"],
              properties: {
                id: { type: "string" },
                title: { type: "string" }
              }
            }
          }
        }
      },
      CheckboxGroup: {
        type: "object",
        required: ["type", "name", "label", "data-source"],
        properties: {
          type: { const: "CheckboxGroup" },
          name: { type: "string", minLength: 1 },
          label: { type: "string", minLength: 1 },
          "data-source": {
            type: "array",
            items: {
              type: "object",
              required: ["id", "title"],
              properties: {
                id: { type: "string" },
                title: { type: "string" }
              }
            }
          }
          // Note: Removed unsupported properties:
          // - default-value
          // - helper-text
          // - min-selections  
          // - max-selections
        }
      },
      EmbeddedLink: {
        type: "object",
        required: ["type", "text", "on-click-action"],
        properties: {
          type: { const: "EmbeddedLink" },
          text: { type: "string", minLength: 1 },
          "on-click-action": {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string" },
              next: { type: "object" },
              payload: { type: "object" }
            }
          },
          style: { type: "string" },
          color: { type: "string" },
          disabled: { type: "boolean" }
        }
      },
      Footer: {
        type: "object",
        required: ["type", "label"],
        properties: {
          type: { const: "Footer" },
          label: { type: "string", minLength: 1 },
          "on-click-action": {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string" },
              next: { type: "string" }
            }
          }
        }
      }
    };

    const schema = componentSchemas[component.type];
    if (!schema) {
      errors.push(`Unknown component type: ${component.type}`);
      return errors;
    }

    // Basic validation without AJV
    if (schema.required) {
      schema.required.forEach(field => {
        if (!(field in component)) {
          errors.push(`${component.type} missing required field: ${field}`);
        }
      });
    }

    return errors;
  }
}

module.exports = Validator;
