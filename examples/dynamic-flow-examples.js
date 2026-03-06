const DynamicFlowBuilder = require('../src/core/DynamicFlowBuilder');

/**
 * Example 1: Dynamic flow with JSON mode and data binding
 */
function createDynamicServicesFlow() {
  console.log('🚀 Creating Dynamic Services Flow...');
  
  const flow = DynamicFlowBuilder.create('dynamic-services', {
    version: '7.0',
    dataApiVersion: '3.0'
  });

  // Add welcome screen with dynamic data
  flow.screen('WELCOME', 'Welcome to Services', {
    userName: '{{user.name}}',
    serviceType: '{{context.service}}',
    timestamp: new Date().toISOString()
  });

  // Add components with dynamic content
  flow.text('Hello {{user.name}}! 👋', 'TextHeading')
    .text('Select a service for {{context.service}}:', 'TextBody')
    .input('service', 'Choose Service', 'dropdown', {
      dataSource: [
        { id: 'pension', title: 'Pension Services' },
        { id: 'aadhaar', title: 'Aadhaar Services' },
        { id: 'pan', title: 'PAN Card Services' }
      ],
      required: true
    })
    .footer('Continue', 'navigate', { next: 'SERVICE_DETAILS' });

  // Add service details screen with conditional content
  flow.screen('SERVICE_DETAILS', 'Service Details', {
    selectedService: '{{form.service}}',
    processingTime: '{{data.services[form.service].processingTime}}',
    documents: '{{data.services[form.service].documents}}'
  });

  flow.text('Service: {{form.service}}', 'TextHeading')
    .text('Processing Time: {{data.services[form.service].processingTime}} days', 'TextBody')
    .text('Required Documents:', 'TextSubheading')
    .text('{{#each data.services[form.service].documents}}• {{this}}{{/each}}', 'TextBody')
    .footer('Proceed', 'navigate', { next: 'CONFIRMATION' });

  // Add confirmation screen
  flow.screen('CONFIRMATION', 'Confirm Your Request', {
    confirmation: '{{user.phone}}',
    serviceId: '{{form.service}}'
  }, { terminal: true });

  flow.text('Please confirm your service request', 'TextHeading')
    .text('Service: {{form.service}}', 'TextBody')
    .text('Confirmation will be sent to: {{user.phone}}', 'TextBody')
    .footer('Confirm Request', 'complete');

  // Add routing for dynamic navigation
  flow.routing({
    WELCOME: ['SERVICE_DETAILS'],
    SERVICE_DETAILS: ['CONFIRMATION']
  });

  const result = flow.build();
  console.log('✅ Dynamic flow created successfully');
  console.log('📊 Flow stats:', flow.getStats());
  
  return result;
}

/**
 * Example 2: Dynamic flow with conditional logic
 */
function createConditionalFlow() {
  console.log('🔄 Creating Conditional Flow...');
  
  const flow = DynamicFlowBuilder.create('conditional-flow');
  
  flow.screen('START', 'Get Started', {
    userType: '{{context.userType}}'
  });

  flow.text('Welcome!', 'TextHeading')
    .switch('{{context.userType}}', {
      'individual': {
        text: 'Individual User Flow',
        next: 'INDIVIDUAL_FORM'
      },
      'business': {
        text: 'Business User Flow', 
        next: 'BUSINESS_FORM'
      },
      'default': {
        text: 'General Flow',
        next: 'GENERAL_FORM'
      }
    });

  // Individual form screen
  flow.screen('INDIVIDUAL_FORM', 'Individual Information', {
    aadhaar: '{{form.aadhaar}}',
    pan: '{{form.pan}}'
  });

  flow.text('Individual Details', 'TextHeading')
    .input('aadhaar', 'Aadhaar Number', 'text', { required: true })
    .input('pan', 'PAN Number', 'text', { required: true })
    .footer('Submit', 'navigate', { next: 'VERIFICATION' });

  // Business form screen
  flow.screen('BUSINESS_FORM', 'Business Information', {
    companyName: '{{form.companyName}}',
    gstin: '{{form.gstin}}'
  });

  flow.text('Business Details', 'TextHeading')
    .input('companyName', 'Company Name', 'text', { required: true })
    .input('gstin', 'GSTIN', 'text', { required: true })
    .footer('Submit', 'navigate', { next: 'VERIFICATION' });

  // General form screen
  flow.screen('GENERAL_FORM', 'General Information', {
    name: '{{form.name}}',
    email: '{{form.email}}'
  });

  flow.text('Basic Details', 'TextHeading')
    .input('name', 'Full Name', 'text', { required: true })
    .input('email', 'Email Address', 'email', { required: true })
    .footer('Submit', 'navigate', { next: 'VERIFICATION' });

  // Verification screen
  flow.screen('VERIFICATION', 'Verification', {
    formData: '{{form}}',
    userType: '{{context.userType}}'
  }, { terminal: true });

  flow.text('Verify Your Information', 'TextHeading')
    .text('User Type: {{context.userType}}', 'TextBody')
    .text('Form Data: {{json form}}', 'TextBody')
    .footer('Confirm', 'complete');

  flow.routing({
    START: ['INDIVIDUAL_FORM', 'BUSINESS_FORM', 'GENERAL_FORM'],
    INDIVIDUAL_FORM: ['VERIFICATION'],
    BUSINESS_FORM: ['VERIFICATION'], 
    GENERAL_FORM: ['VERIFICATION']
  });

  const result = flow.build();
  console.log('✅ Conditional flow created successfully');
  console.log('📊 Flow stats:', flow.getStats());
  
  return result;
}

/**
 * Example 3: Dynamic flow from existing JSON
 */
function createFromExistingFlow() {
  console.log('📝 Creating flow from existing JSON...');
  
  // Example existing flow JSON
  const existingFlow = {
    version: "7.0",
    data_api_version: "3.0",
    routing_model: {
      "WELCOME": ["SERVICES"],
      "SERVICES": ["CONFIRMATION"]
    },
    screens: [
      {
        id: "WELCOME",
        title: "Welcome",
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            { type: "TextBody", text: "Welcome to our service!" }
          ]
        }
      }
    ]
  };

  const flow = DynamicFlowBuilder.fromJSON(existingFlow);
  
  // Add dynamic enhancements
  flow.text('Hello {{user.name}}! Current time: {{context.timestamp}}', 'TextBody')
    .input('service', 'Select Service', 'dropdown', {
      dataSource: [
        { id: 'service1', title: 'Service 1' },
        { id: 'service2', title: 'Service 2' }
      ]
    });

  const result = flow.build();
  console.log('✅ Enhanced flow created successfully');
  
  return result;
}

/**
 * Example 4: DSL mode with dynamic data
 */
function createDynamicDSLFlow() {
  console.log('🎨 Creating Dynamic DSL Flow...');
  
  const flow = new DynamicFlowBuilder('dsl', { name: 'dynamic-dsl-flow' });
  
  flow.screen('HOME', 'Home Screen')
    .textBody('Dynamic DSL Flow')
    .dropdown('choice', 'Make a choice', ['Option 1', 'Option 2', 'Option 3'])
    .footer('Next', 'NEXT_SCREEN');

  flow.screen('NEXT_SCREEN', 'Second Screen', { 
    userChoice: '{{form.choice}}',
    processedAt: new Date().toISOString()
  }, { terminal: true })
    .textBody('You selected: {{form.choice}}')
    .footer('Complete', 'complete');

  const result = flow.build('json');
  console.log('✅ Dynamic DSL flow created successfully');
  
  return result;
}

// Main execution
async function runDynamicExamples() {
  try {
    console.log('🎯 Starting Dynamic Flow Examples...\n');

    // Example 1: Dynamic services flow
    const servicesFlow = createDynamicServicesFlow();
    require('fs').writeFileSync('./output/dynamic-services-flow.json', JSON.stringify(servicesFlow, null, 2));
    console.log('💾 Saved: dynamic-services-flow.json\n');

    // Example 2: Conditional flow
    const conditionalFlow = createConditionalFlow();
    require('fs').writeFileSync('./output/conditional-flow.json', JSON.stringify(conditionalFlow, null, 2));
    console.log('💾 Saved: conditional-flow.json\n');

    // Example 3: Enhanced existing flow
    const enhancedFlow = createFromExistingFlow();
    require('fs').writeFileSync('./output/enhanced-flow.json', JSON.stringify(enhancedFlow, null, 2));
    console.log('💾 Saved: enhanced-flow.json\n');

    // Example 4: DSL mode
    const dslFlow = createDynamicDSLFlow();
    require('fs').writeFileSync('./output/dynamic-dsl-flow.json', JSON.stringify(dslFlow, null, 2));
    console.log('💾 Saved: dynamic-dsl-flow.json\n');

    console.log('🎉 All dynamic flows created successfully!');
    console.log('📁 Check the output/ directory for generated flows');

  } catch (error) {
    console.error('❌ Error creating dynamic flows:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runDynamicExamples();
}

module.exports = {
  createDynamicServicesFlow,
  createConditionalFlow,
  createFromExistingFlow,
  createDynamicDSLFlow,
  runDynamicExamples
};
