/**
 * Hybrid Entry Point - Supports both DSL and JSON approaches
 * Provides unified API for both static and dynamic flow building
 */

const { ErrorHandler } = require('./core/ErrorHandler');
const { VERSION, DATA_API_VERSION } = require('./core/Constants');

// Lazy loading for better performance
let Flow = null;
let FlowBuilder = null;
let createFlow = null;
let FlowJSONBuilder = null;
let DynamicFlowBuilder = null;

const loadCore = () => {
  if (!Flow) {
    Flow = require('./core/FlowOptimized');
  }
  return Flow;
};

const loadBuilder = () => {
  if (!FlowBuilder) {
    const builder = require('./core/FlowBuilder');
    FlowBuilder = builder.FlowBuilder;
    createFlow = builder.createFlow;
  }
  return { FlowBuilder, createFlow };
};

const loadJSONBuilder = () => {
  if (!FlowJSONBuilder) {
    FlowJSONBuilder = require('./core/FlowJSONBuilder');
  }
  return FlowJSONBuilder;
};

const loadDynamicBuilder = () => {
  if (!DynamicFlowBuilder) {
    DynamicFlowBuilder = require('./core/DynamicFlowBuilder');
  }
  return DynamicFlowBuilder;
};

// Component lazy loaders
const loadComponent = (componentName) => {
  return require(`./components/${componentName}`);
};

const loadAction = (actionName) => {
  return require(`./actions/${actionName}`);
};

/**
 * Unified WhatsApp Flow Builder API
 * Supports both DSL and JSON approaches
 */
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
  
  get FlowJSONBuilder() {
    return loadJSONBuilder();
  },
  
  get DynamicFlowBuilder() {
    return loadDynamicBuilder();
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
  
  // Factory methods with error handling
  createFlow: ErrorHandler.wrap((name, options = {}) => {
    const { createFlow } = loadBuilder();
    return createFlow(name, options);
  }, { context: 'createFlow' }),
  
  createJSONFlow: ErrorHandler.wrap((version = "7.0", dataApiVersion = "3.0") => {
    const FlowJSONBuilder = loadJSONBuilder();
    return new FlowJSONBuilder(version, dataApiVersion);
  }, { context: 'createJSONFlow' }),
  
  createDynamicFlow: ErrorHandler.wrap((name, options = {}) => {
    const DynamicFlowBuilder = loadDynamicBuilder();
    return DynamicFlowBuilder.create(name, options);
  }, { context: 'createDynamicFlow' }),
  
  fromJSON: ErrorHandler.wrap((jsonFlow) => {
    const DynamicFlowBuilder = loadDynamicBuilder();
    return DynamicFlowBuilder.fromJSON(jsonFlow);
  }, { context: 'fromJSON' }),
  
  fromDSL: ErrorHandler.wrap((dslFlow) => {
    const DynamicFlowBuilder = loadDynamicBuilder();
    return DynamicFlowBuilder.fromDSL(dslFlow);
  }, { context: 'fromDSL' }),
  
  // Utility methods
  validateFlow: ErrorHandler.wrap((flow) => {
    const ProductionUtils = require('./utils/ProductionUtils');
    return ProductionUtils.validateFlowIntegrity(flow);
  }, { context: 'validateFlow' }),
  
  generateStats: ErrorHandler.wrap((sourcePath = './src') => {
    const ProductionUtils = require('./utils/ProductionUtils');
    return ProductionUtils.generateBundleStats(sourcePath);
  }, { context: 'generateStats' }),
  
  // Production utilities
  utils: {
    get ProductionUtils() {
      return require('./utils/ProductionUtils');
    },
    
    get ErrorHandler() {
      return require('./core/ErrorHandler');
    },
    
    get Constants() {
      return require('./core/Constants');
    }
  },
  
  // Quick start methods - enhanced for both formats
  quick: {
    // Create a simple flow using DSL
    simpleDSL: (name, screens = []) => {
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
              case 'email':
              case 'phone':
              case 'number':
              case 'password':
                flow.textInput(input.name, input.label, input.required, input.type, input.options);
                break;
              case 'dropdown':
                flow.dropdown(input.name, input.label, input.dataSource, input.options);
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
    
    // Create a simple flow using JSON format
    simpleJSON: (name, screens = [], options = {}) => {
      const builder = WhatsAppFlowBuilder.createJSONFlow(options.version, options.dataApiVersion);
      
      screens.forEach(screen => {
        builder.screen(screen.id, screen.title, screen.data || {}, screen.terminal, screen.success);
        
        if (screen.components) {
          screen.components.forEach(comp => {
            builder.addComponent(comp);
          });
        }
      });
      
      return builder;
    },
    
    // Create a form flow (DSL)
    formDSL: (name, title, fields, options = {}) => {
      return WhatsAppFlowBuilder.quick.simpleDSL(name, [
        {
          id: 'FORM',
          title,
          inputs: fields,
          footer: { text: options.footerText || 'Submit', action: 'complete' }
        }
      ]);
    },
    
    // Create a form flow (JSON)
    formJSON: (name, title, fields, options = {}) => {
      const builder = WhatsAppFlowBuilder.createJSONFlow();
      
      builder.screen('FORM', title, {
        formTitle: { type: "string", __example__: title }
      }, true);
      
      fields.forEach(field => {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'phone':
          case 'number':
          case 'password':
            builder.textInput(field.name, field.label, field.required, { 
              inputType: field.type, 
              ...field.options 
            });
            break;
          case 'dropdown':
            builder.dropdown(field.name, field.label, field.dataSource || [], field.required, field.options);
            break;
          case 'radio':
            builder.radioButtonsGroup(field.name, field.label, field.dataSource || [], field.required, field.options);
            break;
        }
      });
      
      builder.footer(options.footerText || 'Submit', 'complete');
      
      return builder;
    },
    
    // Create Maharashtra Services flow (JSON format)
    maharashtraServices: (data = {}) => {
      const FlowJSONBuilder = loadJSONBuilder();
      return FlowJSONBuilder.createWelcomeServiceFlow(data);
    },
    
    // Create a survey flow (DSL)
    surveyDSL: (name, title, questions) => {
      return WhatsAppFlowBuilder.quick.simpleDSL(name, questions.map((question, index) => ({
        id: `Q${index + 1}`,
        title: question.text,
        inputs: question.type === 'multiple' ? [
          {
            type: 'checkbox',
            name: `q${index + 1}`,
            label: '',
            dataSource: question.options
          }
        ] : [
          {
            type: 'dropdown',
            name: `q${index + 1}`,
            label: '',
            dataSource: question.options
          }
        ],
        footer: {
          text: index === questions.length - 1 ? 'Finish Survey' : 'Next',
          action: index === questions.length - 1 ? 'complete' : 'navigate',
          next: index === questions.length - 1 ? null : `Q${index + 2}`
        }
      })));
    },
    
    // Create a survey flow (JSON format)
    surveyJSON: (name, title, questions) => {
      const builder = WhatsAppFlowBuilder.createJSONFlow();
      
      questions.forEach((question, index) => {
        builder.screen(`Q${index + 1}`, question.text, {
          questionText: { type: "string", __example__: question.text }
        });
        
        if (question.type === 'multiple') {
          builder.radioButtonsGroup(`q${index + 1}`, '', question.options, true);
        } else {
          builder.dropdown(`q${index + 1}`, '', question.options, true);
        }
        
        const isLast = index === questions.length - 1;
        builder.footer(
          isLast ? 'Finish Survey' : 'Next',
          isLast ? 'complete' : 'navigate',
          {},
          { next: isLast ? null : `Q${index + 2}` }
        );
      });
      
      return builder;
    }
  },
  
  // Development helpers
  dev: {
    // Test DSL flow creation
    testDSL: () => {
      return WhatsAppFlowBuilder.quick.simpleDSL('TestFlow', [
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
    
    // Test JSON flow creation
    testJSON: () => {
      return WhatsAppFlowBuilder.quick.simpleJSON('TestFlow', [
        {
          id: 'WELCOME',
          title: 'Welcome',
          data: {
            welcomeText: { type: "string", __example__: "Welcome to the test flow!" }
          },
          components: [
            { type: "TextBody", text: "${data.welcomeText}" }
          ]
        }
      ]);
    },
    
    // Performance test
    performanceTest: (screenCount = 10, componentsPerScreen = 5, mode = 'dsl') => {
      if (mode === 'json') {
        const builder = WhatsAppFlowBuilder.createJSONFlow();
        
        for (let i = 0; i < screenCount; i++) {
          builder.screen(`SCREEN_${i}`, `Screen ${i + 1}`, {
            screenIndex: { type: "number", __example__: i }
          });
          
          for (let j = 0; j < componentsPerScreen; j++) {
            builder.textInput(`field_${i}_${j}`, `Field ${j + 1}`, false);
          }
          
          builder.footer('Next', i === screenCount - 1 ? 'complete' : 'navigate', {}, 
                       { next: i === screenCount - 1 ? null : `SCREEN_${i + 1}` });
        }
        
        return builder;
      } else {
        return WhatsAppFlowBuilder.createFlow('PerformanceTest')
          .screen('SCREEN_0', 'Screen 1')
          .textInput('field_0_1', 'Field 1', false)
          .footer('Next', 'navigate', 'SCREEN_1');
      }
    }
  },
  
  // Format conversion utilities
  convert: {
    // DSL to JSON
    dslToJSON: (dslFlow) => {
      const DynamicFlowBuilder = loadDynamicBuilder();
      return DynamicFlowBuilder.fromDSL(dslFlow).convertTo('json');
    },
    
    // JSON to DSL
    jsonToDSL: (jsonFlow) => {
      const DynamicFlowBuilder = loadDynamicBuilder();
      return DynamicFlowBuilder.fromJSON(jsonFlow).convertTo('dsl');
    },
    
    // Auto-detect and convert
    autoConvert: (flow) => {
      // Try to detect format
      if (flow.screens && Array.isArray(flow.screens)) {
        // Likely JSON format
        return WhatsAppFlowBuilder.convert.jsonToDSL(flow);
      } else if (flow.build && typeof flow.build === 'function') {
        // Likely DSL format
        return WhatsAppFlowBuilder.convert.dslToJSON(flow);
      } else {
        throw new Error('Unable to detect flow format');
      }
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
} = require('./core/FlowBuilder');

const LegacyFlow = require('./core/FlowOptimized');

// Legacy exports
module.exports = {
  // Main API
  ...WhatsAppFlowBuilder,
  
  // Legacy compatibility
  Flow: LegacyFlow,
  FlowBuilder: LegacyFlowBuilder,
  createFlow: legacyCreateFlow,
  
  // New JSON builders
  FlowJSONBuilder: () => loadJSONBuilder(),
  DynamicFlowBuilder: () => loadDynamicBuilder(),
  
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
  Screen: require('./core/Screen'),
  Router: require('./core/Router'),
  Validator: require('./core/Validator'),
  Compiler: require('./core/Compiler'),
  
  // Production utilities
  ProductionUtils: require('./utils/ProductionUtils'),
  ErrorHandler: require('./core/ErrorHandler'),
  Constants: require('./core/Constants')
};
