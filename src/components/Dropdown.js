const BaseComponent = require('../core/BaseComponent');
const { ComponentError, ValidationError, ErrorHandler } = require('../core/ErrorHandler');

class Dropdown extends BaseComponent {
  constructor(name, label, dataSource, options = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new ValidationError('Dropdown name is required and must be a string', 'name', name);
      }
      
      if (name.trim().length === 0) {
        throw new ValidationError('Dropdown name cannot be empty', 'name', name);
      }
      
      if (!label || typeof label !== 'string') {
        throw new ValidationError('Dropdown label is required and must be a string', 'label', label);
      }
      
      if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) {
        throw new ComponentError(
          'Dropdown requires a non-empty data source array',
          'Dropdown',
          name
        );
      }
      
      super('Dropdown', name.trim(), label, true, { ...options, dataSource });
      
      // Validate data source structure
      this.validateDataSource(dataSource);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Dropdown.constructor', name, label, dataSource, options });
      throw error;
    }
  }

  validateDataSource(dataSource) {
    try {
      if (!Array.isArray(dataSource)) {
        throw new ComponentError('Data source must be an array', 'Dropdown', this.name);
      }
      
      for (let i = 0; i < dataSource.length; i++) {
        const item = dataSource[i];
        
        if (!item || typeof item !== 'object') {
          throw new ComponentError(
            `Data source item at index ${i} must be an object`,
            'Dropdown',
            this.name
          );
        }
        
        if (!item.id || typeof item.id !== 'string') {
          throw new ComponentError(
            `Data source item at index ${i} must have an id property`,
            'Dropdown',
            this.name
          );
        }
        
        if (!item.title || typeof item.title !== 'string') {
          throw new ComponentError(
            `Data source item at index ${i} must have a title property`,
            'Dropdown',
            this.name
          );
        }
      }
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Dropdown.validateDataSource', name: this.name });
      throw error;
    }
  }

  validateComponent() {
    try {
      const errors = [];
      
      if (this.options.dataSource && this.options.dataSource.length > 50) {
        errors.push('Dropdown cannot have more than 50 options');
      }
      
      if (this.options.dataSource && this.options.dataSource.length === 0) {
        errors.push('Dropdown must have at least one option');
      }

      return errors;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Dropdown.validateComponent', name: this.name });
      throw error;
    }
  }

  // Static factory method
  static create(name, label, dataSource, options = {}) {
    try {
      return new Dropdown(name, label, dataSource, options);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'Dropdown.create', name, label, dataSource, options });
      throw error;
    }
  }
}

module.exports = Dropdown;