class ApiCallAction {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body || null;
    this.params = options.params || {};
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 0;
    this.onSuccess = options.onSuccess || null;
    this.onError = options.onError || null;
    this.transform = options.transform || null;
    this.cache = options.cache || false;
  }

  build() {
    const action = {
      name: 'api_call',
      payload: {
        url: this.endpoint,
        method: this.method,
        headers: this.headers,
        timeout: this.timeout
      }
    };

    if (this.body) {
      action.payload.body = this.body;
    }

    if (Object.keys(this.params).length > 0) {
      action.payload.params = this.params;
    }

    if (this.retries > 0) {
      action.payload.retries = this.retries;
    }

    if (this.onSuccess) {
      action.payload['on-success'] = this.onSuccess;
    }

    if (this.onError) {
      action.payload['on-error'] = this.onError;
    }

    if (this.transform) {
      action.payload.transform = this.transform;
    }

    if (this.cache) {
      action.payload.cache = true;
    }

    return action;
  }

  // Static factory methods
  static get(endpoint, options = {}) {
    return new ApiCallAction(endpoint, { method: 'GET', ...options });
  }

  static post(endpoint, data, options = {}) {
    return new ApiCallAction(endpoint, { 
      method: 'POST', 
      body: data, 
      ...options 
    });
  }

  static put(endpoint, data, options = {}) {
    return new ApiCallAction(endpoint, { 
      method: 'PUT', 
      body: data, 
      ...options 
    });
  }

  static delete(endpoint, options = {}) {
    return new ApiCallAction(endpoint, { method: 'DELETE', ...options });
  }

  static patch(endpoint, data, options = {}) {
    return new ApiCallAction(endpoint, { 
      method: 'PATCH', 
      body: data, 
      ...options 
    });
  }
}

module.exports = ApiCallAction;
