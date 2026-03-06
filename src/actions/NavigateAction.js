class NavigateAction {
  constructor(targetScreen, options = {}) {
    this.targetScreen = targetScreen;
    this.condition = options.condition || null;
    this.data = options.data || {};
    this.clearData = options.clearData || false;
    this.animation = options.animation || null;
  }

  build() {
    const action = {
      name: 'navigate',
      next: this.targetScreen
    };

    if (this.condition) {
      action.condition = this.condition;
    }

    if (Object.keys(this.data).length > 0) {
      action.data = this.data;
    }

    if (this.clearData) {
      action['clear-data'] = true;
    }

    if (this.animation) {
      action.animation = this.animation;
    }

    return action;
  }

  // Static factory methods
  static to(screen, options = {}) {
    return new NavigateAction(screen, options);
  }

  static back(options = {}) {
    return new NavigateAction('BACK', options);
  }

  static home(options = {}) {
    return new NavigateAction('HOME', options);
  }

  static conditional(screen, condition, options = {}) {
    return new NavigateAction(screen, {
      condition,
      ...options
    });
  }
}

module.exports = NavigateAction;
