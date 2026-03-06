class Router {
  constructor() {
    this.routes = new Map();
    this.conditions = new Map();
    this.defaultRoute = null;
  }

  addRoute(fromScreen, toScreen, condition = null) {
    if (!fromScreen || !toScreen) {
      throw new Error('Both fromScreen and toScreen are required');
    }

    if (!this.routes.has(fromScreen)) {
      this.routes.set(fromScreen, []);
    }

    this.routes.get(fromScreen).push({
      to: toScreen,
      condition: condition
    });

    return this;
  }

  addCondition(name, conditionFn) {
    if (typeof conditionFn !== 'function') {
      throw new Error('Condition must be a function');
    }

    this.conditions.set(name, conditionFn);
    return this;
  }

  setDefault(screen) {
    this.defaultRoute = screen;
    return this;
  }

  getNextScreen(currentScreen, data = {}) {
    const routes = this.routes.get(currentScreen);
    
    if (!routes || routes.length === 0) {
      return this.defaultRoute;
    }

    for (const route of routes) {
      if (!route.condition) {
        return route.to;
      }

      const conditionFn = this.conditions.get(route.condition);
      if (conditionFn && conditionFn(data)) {
        return route.to;
      }
    }

    return this.defaultRoute;
  }

  buildRoutingModel() {
    const routingModel = {};

    for (const [conditionName, conditionFn] of this.conditions) {
      routingModel[conditionName] = {
        type: 'conditional',
        // In a real implementation, this would be serialized
        // For now, we'll store a reference
        _condition: conditionFn.toString()
      };
    }

    return routingModel;
  }

  validateFlow(flow) {
    const screenIds = flow.screens.map(s => s.id);
    const errors = [];

    // Check if all route destinations exist
    for (const [fromScreen, routes] of this.routes) {
      if (!screenIds.includes(fromScreen)) {
        errors.push(`Route source screen "${fromScreen}" not found in flow`);
      }

      routes.forEach(route => {
        if (!screenIds.includes(route.to)) {
          errors.push(`Route destination screen "${route.to}" not found in flow`);
        }
      });
    }

    // Check if default route exists
    if (this.defaultRoute && !screenIds.includes(this.defaultRoute)) {
      errors.push(`Default route screen "${this.defaultRoute}" not found in flow`);
    }

    return errors;
  }

  // Helper methods for common conditions
  static equals(field, value) {
    return (data) => data[field] === value;
  }

  static notEquals(field, value) {
    return (data) => data[field] !== value;
  }

  static contains(field, value) {
    return (data) => {
      const fieldValue = data[field];
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return String(fieldValue).includes(value);
    };
  }

  static greaterThan(field, value) {
    return (data) => Number(data[field]) > Number(value);
  }

  static lessThan(field, value) {
    return (data) => Number(data[field]) < Number(value);
  }

  static isEmpty(field) {
    return (data) => {
      const value = data[field];
      return value === null || value === undefined || value === '';
    };
  }

  static isNotEmpty(field) {
    return (data) => {
      const value = data[field];
      return value !== null && value !== undefined && value !== '';
    };
  }

  static inArray(field, values) {
    return (data) => values.includes(data[field]);
  }

  static matches(field, pattern) {
    return (data) => {
      const regex = new RegExp(pattern);
      return regex.test(data[field]);
    };
  }

  // Complex conditions
  static and(...conditions) {
    return (data) => conditions.every(condition => condition(data));
  }

  static or(...conditions) {
    return (data) => conditions.some(condition => condition(data));
  }

  static not(condition) {
    return (data) => !condition(data);
  }
}

module.exports = Router;
