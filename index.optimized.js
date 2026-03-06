/**
 * Optimized entry point for WhatsApp Flow Builder Framework
 * Production-ready with lazy loading and error handling
 */

const { ErrorHandler } = require('./src/core/ErrorHandler');
const { VERSION, DATA_API_VERSION } = require('./src/core/Constants');

// Lazy loading for better performance
let Flow = null;
let FlowBuilder = null;
let createFlow = null;

const loadCore = () => {
  if (!Flow) {
    const core = require('./src/core/FlowOptimized');
    Flow = core;
  }
  return Flow;
};

const loadBuilder = () => {
  if (!FlowBuilder) {
    const builder = require('./src/core/FlowBuilder');
    FlowBuilder = builder.FlowBuilder;
    createFlow = builder.createFlow;
  }
  return { FlowBuilder, createFlow };
};

// Component lazy loaders
const loadComponent = (componentName) => {
  return require(`./src/components/${componentName}`);
};

const loadAction = (actionName) => {
  return require(`./src/actions/${actionName}`);
};

// Main API with error handling
const WhatsAppFlowBuilder = {
  // Version info
  VERSION,
  DATA_API_VERSION,
  
  // Core classes (lazy loaded)
  get Flow() {
    return loadCore();
  },
  
  get FlowBuilder() {
    return loadBuilder().FlowBuilder;
  },
  
  get createFlow() {
    return loadBuilder().createFlow;
  },
  
  // Components (lazy loaded)
  get TextInput() {
    return loadComponent('TextInput');
  },
  
  get Dropdown() {
    return loadComponent('Dropdown');
  },
  
  get CheckboxGroup() {
    return loadComponent('CheckboxGroup');
  },
  
  get Footer() {
    return loadComponent('Footer');
  },
  
  get TextBody() {
    return loadComponent('TextBody');
  },
  
  get EmbeddedLink() {
    return loadComponent('EmbeddedLink');
  },
  
  // Actions (lazy loaded)
  get SubmitAction() {
    return loadAction('SubmitAction');
  },
  
  get NavigateAction() {
    return loadAction('NavigateAction');
  },
  
  get ApiCallAction() {
    return loadAction('ApiCallAction');
  },
  
  // Utility methods
  createFlow: ErrorHandler.wrap((name, options) => {
    const { createFlow } = loadBuilder();
    return createFlow(name, options);
  }, { context: 'createFlow' }),
  
  validateFlow: ErrorHandler.wrap((flow) => {
    const ProductionUtils = require('./src/utils/ProductionUtils');
    return ProductionUtils.validateFlowIntegrity(flow);
  }, { context: 'validateFlow' }),
  
  generateStats: ErrorHandler.wrap((sourcePath) => {
    const ProductionUtils = require('./src/utils/ProductionUtils');
    return ProductionUtils.generateBundleStats(sourcePath);
  }, { context: 'generateStats' }),
  
  // Production utilities
  utils: {
    get ProductionUtils() {
      return require('./src/utils/ProductionUtils');
    },
    
    get ErrorHandler() {
      return require('./src/core/ErrorHandler');
    },
    
    get Constants() {
      return require('./src/core/Constants');
    }
  },
  
  // Quick start methods
  quick: {
    // Create a simple flow with common components
    simple: (name, screens = []) => {
      const flow = WhatsAppFlowBuilder.createFlow(name);
      
      screens.forEach(screen => {
        flow.screen(screen.id, screen.title);
        
        if (screen.text) {
          flow.textBody(screen.text);
        }
        
        if (screen.inputs) {
          screen.inputs.forEach(input => {
            switch (input.type) {
              case 'text':
                flow.textInput(input.name, input.label, input.required, input.inputType, input.options);
                break;
              case 'dropdown':
                flow.dropdown(input.name, input.label, input.options, input.dataSource);
                break;
              case 'checkbox':
                flow.checkboxGroup(input.name, input.label, input.dataSource, input.options);
                break;
            }
          });
        }
        
        if (screen.footer) {
          flow.footer(screen.footer.text, screen.footer.action, screen.footer.next);
        }
      });
      
      return flow;
    },
    
    // Create a form flow
    form: (name, title, fields, options = {}) => {
      const flow = WhatsAppFlowBuilder.createFlow(name, options);
      
      flow.screen('FORM', title);
      
      fields.forEach(field => {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'phone':
          case 'number':
          case 'password':
            flow.textInput(field.name, field.label, field.required, field.type, field.options);
            break;
          case 'dropdown':
            flow.dropdown(field.name, field.label, field.dataSource, field.options);
            break;
          case 'checkbox':
            flow.checkboxGroup(field.name, field.label, field.dataSource, field.options);
            break;
        }
      });
      
      flow.footer(options.footerText || 'Submit', 'complete');
      
      return flow;
    },
    
    // Create a survey flow
    survey: (name, title, questions) => {
      const flow = WhatsAppFlowBuilder.createFlow(name);
      
      questions.forEach((question, index) => {
        flow.screen(`Q${index + 1}`, question.text);
        
        if (question.type === 'multiple') {
          flow.checkboxGroup(`q${index + 1}`, '', question.options, { required: true });
        } else {
          flow.dropdown(`q${index + 1}`, '', question.options, { required: true });
        }
        
        const isLast = index === questions.length - 1;
        flow.footer(
          isLast ? 'Finish Survey' : 'Next',
          isLast ? 'complete' : 'navigate',
          isLast ? null : `Q${index + 2}`
        );
      });
      
      return flow;
    }
  },
  
  // Development helpers
  dev: {
    // Test flow creation
    test: () => {
      return WhatsAppFlowBuilder.quick.simple('TestFlow', [
        {
          id: 'WELCOME',
          title: 'Welcome',
          text: 'Welcome to the test flow!',
          inputs: [
            { type: 'text', name: 'name', label: 'Your Name', required: true }
          ],
          footer: { text: 'Continue', action: 'navigate', next: 'FORM' }
        },
        {
          id: 'FORM',
          title: 'Details',
          inputs: [
            { type: 'email', name: 'email', label: 'Email', required: true },
            { type: 'dropdown', name: 'country', label: 'Country', dataSource: [
              { id: 'us', title: 'United States' },
              { id: 'uk', title: 'United Kingdom' }
            ]}
          ],
          footer: { text: 'Submit', action: 'complete' }
        }
      ]);
    },
    
    // Performance test
    performanceTest: (screenCount = 10, componentsPerScreen = 5) => {
      const flow = WhatsAppFlowBuilder.createFlow('PerformanceTest');
      
      for (let i = 0; i < screenCount; i++) {
        flow.screen(`SCREEN_${i}`, `Screen ${i + 1}`);
        
        for (let j = 0; j < componentsPerScreen; j++) {
          flow.textInput(`field_${i}_${j}`, `Field ${j + 1}`, false);
        }
        
        flow.footer('Next', i === screenCount - 1 ? 'complete' : 'navigate', 
                   i === screenCount - 1 ? null : `SCREEN_${i + 1}`);
      }
      
      return flow;
    }
  }
};

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhatsAppFlowBuilder;
}

// Global availability for browser environments
if (typeof window !== 'undefined') {
  window.WhatsAppFlowBuilder = WhatsAppFlowBuilder;
}

// Export individual classes for backward compatibility
const { 
  FlowBuilder: LegacyFlowBuilder, 
  createFlow: legacyCreateFlow 
} = require('./src/core/FlowBuilder');

const LegacyFlow = require('./src/core/FlowOptimized');

// Legacy exports
module.exports = {
  // Main API
  ...WhatsAppFlowBuilder,
  
  // Legacy compatibility
  Flow: LegacyFlow,
  FlowBuilder: LegacyFlowBuilder,
  createFlow: legacyCreateFlow,
  
  // Components (for direct access)
  TextInput: () => loadComponent('TextInput'),
  Dropdown: () => loadComponent('Dropdown'),
  CheckboxGroup: () => loadComponent('CheckboxGroup'),
  Footer: () => loadComponent('Footer'),
  TextBody: () => loadComponent('TextBody'),
  EmbeddedLink: () => loadComponent('EmbeddedLink'),
  
  // Actions (for direct access)
  SubmitAction: () => loadAction('SubmitAction'),
  NavigateAction: () => loadAction('NavigateAction'),
  ApiCallAction: () => loadAction('ApiCallAction'),
  
  // Utilities
  Screen: require('./src/core/Screen'),
  Router: require('./src/core/Router'),
  Validator: require('./src/core/Validator'),
  Compiler: require('./src/core/Compiler'),
  
  // Production utilities
  ProductionUtils: require('./src/utils/ProductionUtils'),
  ErrorHandler: require('./src/core/ErrorHandler'),
  Constants: require('./src/core/Constants')
};
