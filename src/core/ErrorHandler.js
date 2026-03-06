/**
 * Centralized error handling for WhatsApp Flow Builder
 */

class FlowError extends Error {
  constructor(message, code = 'FLOW_ERROR', details = {}) {
    super(message);
    this.name = 'FlowError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

class ValidationError extends FlowError {
  constructor(message, field = null, value = null) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

class ComponentError extends FlowError {
  constructor(message, componentType = null, componentName = null) {
    super(message, 'COMPONENT_ERROR', { componentType, componentName });
    this.name = 'ComponentError';
  }
}

class ScreenError extends FlowError {
  constructor(message, screenId = null) {
    super(message, 'SCREEN_ERROR', { screenId });
    this.name = 'ScreenError';
  }
}

class ErrorHandler {
  static handle(error, context = {}) {
    console.error(`[${new Date().toISOString()}] Flow Error:`, {
      error: error instanceof FlowError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    });

    if (process.env.NODE_ENV === 'development') {
      throw error;
    }

    // In production, return formatted error
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      }
    };
  }

  static wrap(fn, context = {}) {
    return (...args) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch(error => ErrorHandler.handle(error, context));
        }
        return result;
      } catch (error) {
        return ErrorHandler.handle(error, context);
      }
    };
  }

  static async wrapAsync(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return ErrorHandler.handle(error, context);
      }
    };
  }
}

module.exports = {
  FlowError,
  ValidationError,
  ComponentError,
  ScreenError,
  ErrorHandler
};
