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
    
    // Set checkbox-specific options (only use WhatsApp Flow supported properties)
    this.options.dataSource = dataSource;
    
    // Note: WhatsApp Flow doesn't officially support these properties in CheckboxGroup:
    // - default-value
    // - helper-text  
    // - min-selections
    // - max-selections
    // These are being removed to match official schema
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

    return errors;
  }

  getPropertyMap() {
    // Only map to officially supported WhatsApp Flow properties
    return {
      ...super.getPropertyMap(),
      dataSource: 'data-source'
    };
  }

  // Static factory method
  static create(name, label, dataSource, options = {}) {
    return new CheckboxGroup(name, label, dataSource, options);
  }
}

module.exports = CheckboxGroup;