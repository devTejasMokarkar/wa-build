const BaseComponent = require('../core/BaseComponent');
const { ComponentError } = require('../core/ErrorHandler');

class CheckboxGroup extends BaseComponent {
  constructor(name, label, dataSource, options = {}) {
    super('CheckboxGroup', name, label, options.required || false, options);
    
    // Validate data source
    if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) {
      throw new ComponentError(
        'CheckboxGroup requires a non-empty data source array',
        'CheckboxGroup',
        name
      );
    }

    // Validate data source structure
    this.validateDataSource(dataSource);
    
    // Set checkbox-specific options
    this.options.dataSource = dataSource;
    this.options.minSelections = options.minSelections || 0;
    this.options.maxSelections = options.maxSelections || dataSource.length;
    this.options.defaultValue = options.defaultValue || [];
    this.options.helperText = options.helperText || '';
  }

  validateDataSource(dataSource) {
    for (const item of dataSource) {
      if (!item.id || !item.title) {
        throw new ComponentError(
          'Each data source item must have id and title properties',
          'CheckboxGroup',
          this.name
        );
      }
    }
  }

  validateComponent() {
    const errors = [];
    
    if (this.options.dataSource && this.options.dataSource.length > 20) {
      errors.push('CheckboxGroup cannot have more than 20 options');
    }
    
    if (this.options.minSelections > this.options.maxSelections) {
      errors.push('minSelections cannot be greater than maxSelections');
    }
    
    if (this.options.maxSelections > this.options.dataSource.length) {
      errors.push('maxSelections cannot be greater than the number of available options');
    }

    return errors;
  }

  getPropertyMap() {
    return {
      ...super.getPropertyMap(),
      minSelections: 'min-selections',
      maxSelections: 'max-selections',
      defaultValue: 'default-value',
      helperText: 'helper-text',
      dataSource: 'data-source'
    };
  }

  // Static factory method
  static create(name, label, dataSource, options = {}) {
    return new CheckboxGroup(name, label, dataSource, options);
  }
}

module.exports = CheckboxGroup;