const { ComponentError, ValidationError, ErrorHandler } = require('../core/ErrorHandler');

class EmbeddedLink {
  constructor(text, action, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('EmbeddedLink text is required and must be a string', 'text', text);
      }
      
      if (text.trim().length === 0) {
        throw new ValidationError('EmbeddedLink text cannot be empty', 'text', text);
      }
      
      if (!action) {
        throw new ValidationError('EmbeddedLink action is required', 'action', action);
      }
      
      if (typeof action !== 'object') {
        throw new ValidationError('EmbeddedLink action must be an object', 'action', action);
      }
      
      const validStyles = ['button', 'text', 'link'];
      const style = options.style || 'button';
      if (!validStyles.includes(style)) {
        throw new ValidationError(`Invalid style: ${style}. Valid styles: ${validStyles.join(', ')}`, 'style', style);
      }
      
      this.text = text.trim();
      this.action = action;
      this.style = style;
      this.color = options.color || null;
      this.disabled = Boolean(options.disabled);
    } catch (error) {
      ErrorHandler.handle(error, { method: 'EmbeddedLink.constructor', text, action, options });
      throw error;
    }
  }

  build() {
    try {
      if (!this.text || !this.action) {
        throw new ComponentError('EmbeddedLink must have text and action', 'EmbeddedLink', 'unknown');
      }
      
      const component = {
        type: "EmbeddedLink",
        text: this.text,
        "on-click-action": this.action
      };

      if (this.style !== 'button') component.style = this.style;
      if (this.color) component.color = this.color;
      if (this.disabled) component.disabled = true;

      return component;
    } catch (error) {
      ErrorHandler.handle(error, { method: 'EmbeddedLink.build', text: this.text });
      throw error;
    }
  }

  // Static factory methods
  static navigate(text, targetScreen, payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Navigate link text is required and must be a string', 'text', text);
      }
      
      if (!targetScreen || typeof targetScreen !== 'string') {
        throw new ValidationError('Target screen is required and must be a string', 'targetScreen', targetScreen);
      }
      
      if (targetScreen.trim().length === 0) {
        throw new ValidationError('Target screen cannot be empty', 'targetScreen', targetScreen);
      }
      
      return new EmbeddedLink(text, {
        name: "navigate",
        next: {
          type: "screen",
          name: targetScreen.trim()
        },
        payload
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'EmbeddedLink.navigate', text, targetScreen, payload });
      throw error;
    }
  }

  static complete(text, payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('Complete link text is required and must be a string', 'text', text);
      }
      
      return new EmbeddedLink(text, {
        name: "complete",
        payload
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'EmbeddedLink.complete', text, payload });
      throw error;
    }
  }

  static api(text, endpoint, method = 'POST', payload = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new ValidationError('API link text is required and must be a string', 'text', text);
      }
      
      if (!endpoint || typeof endpoint !== 'string') {
        throw new ValidationError('API endpoint is required and must be a string', 'endpoint', endpoint);
      }
      
      if (endpoint.trim().length === 0) {
        throw new ValidationError('API endpoint cannot be empty', 'endpoint', endpoint);
      }
      
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      const normalizedMethod = method.toUpperCase();
      if (!validMethods.includes(normalizedMethod)) {
        throw new ValidationError(`Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(', ')}`, 'method', method);
      }
      
      return new EmbeddedLink(text, {
        name: "api_call",
        payload: {
          url: endpoint.trim(),
          method: normalizedMethod,
          body: payload
        }
      });
    } catch (error) {
      ErrorHandler.handle(error, { method: 'EmbeddedLink.api', text, endpoint, method, payload });
      throw error;
    }
  }
}

module.exports = EmbeddedLink;
