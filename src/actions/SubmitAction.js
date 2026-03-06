class SubmitAction {
  constructor(options = {}) {
    this.name = options.name || 'complete';
    this.data = options.data || {};
    this.endpoint = options.endpoint || null;
    this.headers = options.headers || {};
    this.method = options.method || 'POST';
    this.transform = options.transform || null;
    this.validate = options.validate || null;
  }

  build() {
    const action = {
      name: this.name
    };

    if (this.endpoint) {
      action.payload = {
        url: this.endpoint,
        method: this.method,
        headers: this.headers
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
  }

  // Static factory methods
  static complete(data = {}) {
    return new SubmitAction({
      name: 'complete',
      data
    });
  }

  static api(endpoint, options = {}) {
    return new SubmitAction({
      name: 'api_call',
      endpoint,
      ...options
    });
  }

  static webhook(url, data = {}) {
    return new SubmitAction({
      name: 'webhook',
      endpoint: url,
      method: 'POST',
      data
    });
  }
}

module.exports = SubmitAction;
