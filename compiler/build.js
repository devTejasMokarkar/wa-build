const { createFlow } = require('../src/core/FlowBuilder');
const Compiler = require('../src/core/Compiler');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

async function buildFlow() {
  try {
    console.log(chalk.blue('🚀 Building WhatsApp Flow...'));

    // Example flow using DSL syntax
    const flow = createFlow('PensionFlow', {
      version: '2.0.0',
      dataApiVersion: '3.0'
    });

    flow
      .screen('WELCOME', { title: 'Welcome to Pension Portal' })
      .text('name', 'Your Full Name', { required: true })
      .text('email', 'Email Address', { 
        required: true, 
        type: 'email',
        placeholder: 'john@example.com'
      })
      .next('Continue', 'PURPOSE')
      .screen('PURPOSE', { title: 'Select Services' })
      .checkbox('services', 'What services do you need?', [
        { id: 'electricity', title: 'Electricity Bill' },
        { id: 'water', title: 'Water Bill' },
        { id: 'gas', title: 'Gas Bill' },
        { id: 'internet', title: 'Internet Bill' }
      ], { required: true, minSelections: 1 })
      .dropdown('priority', 'Priority Level', [
        { id: 'low', title: 'Low Priority' },
        { id: 'medium', title: 'Medium Priority' },
        { id: 'high', title: 'High Priority' },
        { id: 'urgent', title: 'Urgent' }
      ])
      .next('Continue', 'UPLOAD')
      .screen('UPLOAD', { title: 'Upload Documents' })
      .text('document_id', 'Document ID Number', { required: true })
      .text('reference', 'Reference Number', { required: false })
      .submit('Submit Application')
      .when('services_selected', 'SUCCESS', 'ERROR')
      .screen('SUCCESS', { title: 'Application Submitted', terminal: true })
      .data('message', 'Your application has been submitted successfully!')
      .screen('ERROR', { title: 'Error', terminal: true })
      .data('message', 'There was an error processing your application.');

    // Validate the flow
    flow.validate();

    // Initialize compiler
    const compiler = new Compiler({
      outputDir: './output',
      versioning: true,
      validate: true
    });

    // Build and save the flow
    const builtFlow = flow.build();
    
    // Print statistics
    compiler.printStats(builtFlow);

    // Save with versioning
    const outputPath = await compiler.saveToFile(builtFlow, 'pension-flow', '2.0.0');

    // Also save a minified version
    const minifiedCompiler = new Compiler({
      outputDir: './output',
      minify: true
    });
    
    await minifiedCompiler.saveToFile(builtFlow, 'pension-flow-minified');

    console.log(chalk.green('\n✅ Flow built successfully!'));
    console.log(chalk.cyan(`📁 Output: ${outputPath}`));

    return builtFlow;

  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error.message);
    process.exit(1);
  }
}

// Run the build
if (require.main === module) {
  buildFlow();
}

module.exports = buildFlow;
