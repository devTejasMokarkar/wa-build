class EmbeddedLink {
  constructor(text, action, options = {}) {
    if (!text) throw new Error('EmbeddedLink text is required');
    if (!action) throw new Error('EmbeddedLink action is required');
    
    this.text = text;
    this.action = action;
    this.style = options.style || 'button';
    this.color = options.color || null;
    this.disabled = options.disabled || false;
  }

  build() {
    const component = {
      type: "EmbeddedLink",
      text: this.text,
      "on-click-action": this.action
    };

    if (this.style !== 'button') component.style = this.style;
    if (this.color) component.color = this.color;
    if (this.disabled) component.disabled = true;

    return component;
  }

  // Static factory methods
  static navigate(text, targetScreen, payload = {}) {
    return new EmbeddedLink(text, {
      name: "navigate",
      next: {
        type: "screen",
        name: targetScreen
      },
      payload
    });
  }

  static complete(text, payload = {}) {
    return new EmbeddedLink(text, {
      name: "complete",
      payload
    });
  }

  static api(text, endpoint, method = 'POST', payload = {}) {
    return new EmbeddedLink(text, {
      name: "api_call",
      payload: {
        url: endpoint,
        method,
        body: payload
      }
    });
  }
}

module.exports = EmbeddedLink;
