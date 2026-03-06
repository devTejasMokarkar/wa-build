const { ValidationError, ComponentError, ErrorHandler } = require('../core/ErrorHandler');

class SubmitAction {
  constructor(options = {}) {
    try {
      if (!options || typeof options !== 'object') {
        throw new ValidationError('SubmitAction options must be an object', 'options', options);
      }
      
      this.name = options.name || 'complete';
      this.data = options.data || {};
      this.endpoint = options.endpoint || null;
      this.headers = options.headers || {};
      this.method = options.method || 'POST';
      this.transform = options.transform || null;
      this.validate = options.validate || null;
      
      // Validate method
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!validMethods.includes(this.method.toUpperCase())) {
        throw new ValidationError(`Invalid HTTP method: ${this.method}. Valid methods: ${validMethods.join(', ')}`, 'method', this.method);
      }
      
      this.method = this.method.toUpperCase();
      
      // Validate endpoint if provided
      if (this.endpoint && typeof this.endpoint !== 'string') {
        throw new ValidationError('Endpoint must be a string', 'endpoint', this.endpoint);
      }
      
      if (this.endpoint && this.endpoint.trim().length === 0) {
        throw new ValidationError('Endpoint cannot be empty', 'endpoint', this.endpoint);
      }
      
    } catch (error) {
      ErrorHandler.handle(error, { method: 'SubmitAction.constructor', options });
      throw error;
    }
  }

  build() {
    try {
      if (!this.name || typeof this.name !== 'string') {
        throw new ValidationError('SubmitAction name is required and must be a string', 'name', this.name);
      }
      
      const action = {
        name: this.name
      };

      if (this.endpoint) {
        action.payload = {
          url: this.endpoint.trim(),
          method: this.method,
          headers: this.headers || {}
        };

        if (Object.keys(this.data).length > 0) {
          action.payload.body = this.data;
        }

        if (this.transform) {
          action.payload.transform = this.transform;
        }
      }

      if (this.validate) {
        action.validation = this.validate;
      }

      return action;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'SubmitAction.build', name: this.name });
      throw error;
    }
  }

  // Static factory methods
  static complete(data = {}) {
    try {
      if (!data || typeof data !== 'object') {
        throw new ValidationError('Complete action data must be an object', 'data', data);
      }
      
      return new SubmitAction({
        name: 'complete',
        data
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'SubmitAction.complete', data });
      throw error;
    }
  }

  static api(endpoint, options = {}) {
    try {
      if (!endpoint || typeof endpoint !== 'string') {
        throw new ValidationError('API endpoint is required and must be a string', 'endpoint', endpoint);
      }
      
      if (endpoint.trim().length === 0) {
        throw new ValidationError('API endpoint cannot be empty', 'endpoint', endpoint);
      }
      
      return new SubmitAction({
        name: 'api_call',
        endpoint: endpoint.trim(),
        ...options
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'SubmitAction.api', endpoint, options });
      throw error;
    }
  }

  static webhook(url, data = {}) {
    try {
      if (!url || typeof url !== 'string') {
        throw new ValidationError('Webhook URL is required and must be a string', 'url', url);
      }
      
      if (url.trim().length === 0) {
        throw new ValidationError('Webhook URL cannot be empty', 'url', url);
      }
      
      if (!data || typeof data !== 'object') {
        throw new ValidationError('Webhook data must be an object', 'data', data);
      }
      
      return new SubmitAction({
        name: 'webhook',
        endpoint: url.trim(),
        method: 'POST',
        data
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'SubmitAction.webhook', url, data });
      throw error;
    }
  }
}

module.exports = SubmitAction;
