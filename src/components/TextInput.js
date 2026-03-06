const BaseComponent = require('../core/BaseComponent');
const { INPUT_TYPES, VALIDATION_RULES } = require('../core/Constants');
const { ComponentError, ValidationError, ErrorHandler } = require('../core/ErrorHandler');

class TextInput extends BaseComponent {
  constructor(name, label, required = true, inputType = INPUT_TYPES.TEXT, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('TextInput name is required and must be a string', 'name', name);
      }
      
      if (name.trim().length === 0) {
        throw new ValidationError('TextInput name cannot be empty', 'name', name);
      }
      
      if (!label || typeof label !== 'string') {
        throw new ValidationError('TextInput label is required and must be a string', 'label', label);
      }
      
      if (!Object.values(INPUT_TYPES).includes(inputType)) {
        throw new ComponentError(
          `Invalid input type: ${inputType}. Must be one of: ${Object.values(INPUT_TYPES).join(', ')}`,
          'TextInput',
          name
        );
      }
      
      super('TextInput', name.trim(), label, required, { ...options, inputType });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.constructor', name, label, required, inputType, options });
      throw error;
    }
  }

  validateComponent() {
    try {
      const errors = [];
      
      if (this.options.maxLength && this.options.maxLength > VALIDATION_RULES.MAX_LENGTH) {
        errors.push(`maxLength cannot exceed ${VALIDATION_RULES.MAX_LENGTH}`);
      }
      
      if (this.options.minLength && this.options.minLength < VALIDATION_RULES.MIN_LENGTH) {
        errors.push(`minLength cannot be less than ${VALIDATION_RULES.MIN_LENGTH}`);
      }
      
      if (this.name.length > VALIDATION_RULES.MAX_COMPONENT_NAME_LENGTH) {
        errors.push(`Component name cannot exceed ${VALIDATION_RULES.MAX_COMPONENT_NAME_LENGTH} characters`);
      }
      
      if (this.label.length > VALIDATION_RULES.MAX_LABEL_LENGTH) {
        errors.push(`Label cannot exceed ${VALIDATION_RULES.MAX_LABEL_LENGTH} characters`);
      }

      return errors;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.validateComponent', name: this.name });
      throw error;
    }
  }

  build() {
    try {
      const component = super.build();
      
      if (!component) {
        throw new ComponentError('Failed to build base component', 'TextInput', this.name);
      }
      
      // Add input-type specific to TextInput
      component['input-type'] = this.options.inputType;
      
      return component;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.build', name: this.name });
      throw error;
    }
  }

  // Static factory methods for common input types
  static text(name, label, required = true, options = {}) {
    try {
      return new TextInput(name, label, required, INPUT_TYPES.TEXT, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.text', name, label, required, options });
      throw error;
    }
  }

  static email(name, label, required = true, options = {}) {
    try {
      return new TextInput(name, label, required, INPUT_TYPES.EMAIL, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.email', name, label, required, options });
      throw error;
    }
  }

  static phone(name, label, required = true, options = {}) {
    try {
      return new TextInput(name, label, required, INPUT_TYPES.PHONE, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.phone', name, label, required, options });
      throw error;
    }
  }

  static number(name, label, required = true, options = {}) {
    try {
      return new TextInput(name, label, required, INPUT_TYPES.NUMBER, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.number', name, label, required, options });
      throw error;
    }
  }

  static password(name, label, required = true, options = {}) {
    try {
      return new TextInput(name, label, required, INPUT_TYPES.PASSWORD, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'TextInput.password', name, label, required, options });
      throw error;
    }
  }
}

module.exports = TextInput;