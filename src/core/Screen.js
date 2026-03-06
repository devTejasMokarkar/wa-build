class Screen {
  constructor(id, options = {}) {
    if (!id) {
      throw new Error('Screen ID is required');
    }
    
    this.id = id;
    this.title = options.title || id;
    this.terminal = options.terminal || false;
    this.components = [];
    this.layout = options.layout || "SingleColumnLayout";
    this.data = options.data || {};
  }

  add(component) {
    if (!component || typeof component !== 'object') {
      throw new Error("Component must be a valid object");
    }
    
    this.components.push(component);
    return this;
  }

  setTerminal(terminal = true) {
    this.terminal = terminal;
    return this;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setLayout(layoutType) {
    this.layout = layoutType;
    return this;
  }

  setData(key, value) {
    this.data[key] = value;
    return this;
  }

  addData(dataObject) {
    this.data = { ...this.data, ...dataObject };
    return this;
  }

  build() {
    return {
      id: this.id,
      title: this.title,
      terminal: this.terminal,
      data: Object.keys(this.data).length > 0 ? this.data : undefined,
      layout: {
        type: this.layout,
        children: this.components.map(c => c.build ? c.build() : c)
      }
    };
  }

  clone(newId) {
    const cloned = new Screen(newId || `${this.id}_copy`, {
      title: this.title,
      terminal: this.terminal,
      layout: this.layout,
      data: { ...this.data }
    });
    
    cloned.components = [...this.components];
    return cloned;
  }
}

module.exports = Screen;
