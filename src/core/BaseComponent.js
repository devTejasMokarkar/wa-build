/**
 * Base component class for all WhatsApp Flow components
 * Provides common validation, building, and utility methods
 */
class BaseComponent {
  constructor(type, name, label, required = false, options = {}) {
    this.validateRequired(type, name, label);
    
    this.type = type;
    this.name = name;
    this.label = label;
    this.required = required;
    this.options = { ...options };
  }

  validateRequired(type, name, label) {
    if (!type) throw new Error(`${this.constructor.name}: type is required`);
    if (!name) throw new Error(`${this.constructor.name}: name is required`);
    if (!label) throw new Error(`${this.constructor.name}: label is required`);
  }

  build() {
    const component = {
      type: this.type,
      name: this.name,
      label: this.label,
      required: this.required
    };

    // Add optional properties from options
    const propertyMap = this.getPropertyMap();
    for (const [key, componentKey] of Object.entries(propertyMap)) {
      if (this.options[key] !== undefined && this.options[key] !== null) {
        component[componentKey] = this.options[key];
      }
    }

    return component;
  }

  getPropertyMap() {
    return {
      placeholder: 'placeholder',
      maxLength: 'max-length',
      minLength: 'min-length',
      defaultValue: 'default-value',
      helperText: 'helper-text',
      validation: 'validation',
      dataSource: 'data-source',
      inputType: 'input-type',
      text: 'text',
      markdown: 'markdown'
    };
  }

  validate() {
    const errors = [];
    
    if (this.required && !this.name) {
      errors.push(`${this.type} component requires a name`);
    }
    
    if (this.required && !this.label) {
      errors.push(`${this.type} component requires a label`);
    }

    // Component-specific validation
    const componentErrors = this.validateComponent();
    errors.push(...componentErrors);

    return errors;
  }

  validateComponent() {
    // Override in subclasses for specific validation
    return [];
  }

  static create(name, label, required = false, options = {}) {
    return new this(name, label, required, options);
  }
}

module.exports = BaseComponent;
