const Validator = require('../src/core/Validator');
const Compiler = require('../src/core/Compiler');
const chalk = require('chalk');
const fs = require('fs-extra');

async function validateFlow(filePath = './output/pension-flow.json') {
  try {
    console.log(chalk.blue('🔍 Validating WhatsApp Flow...'));

    // Load the flow file
    const compiler = new Compiler();
    const flow = await compiler.loadFromFile(filePath);

    // Initialize validator
    const validator = new Validator();

    // Validate the flow
    const errors = validator.validateFlow(flow);

    if (errors.length === 0) {
      console.log(chalk.green('✅ Flow is valid!'));
      
      // Print statistics
      const stats = compiler.generateStats(flow);
      console.log(chalk.cyan('\n📊 Flow Statistics:'));
      console.log(`  Total Screens: ${stats.totalScreens}`);
      console.log(`  Terminal Screens: ${stats.terminalScreens}`);
      console.log(`  Total Components: ${stats.totalComponents}`);
      console.log(`  Has Routing: ${stats.hasRouting ? 'Yes' : 'No'}`);
      
      return true;
    } else {
      console.log(chalk.red('\n❌ Validation errors found:'));
      errors.forEach((error, index) => {
        console.log(chalk.red(`  ${index + 1}. ${error}`));
      });
      
      return false;
    }

  } catch (error) {
    console.error(chalk.red('❌ Validation failed:'), error.message);
    return false;
  }
}

// Run validation
if (require.main === module) {
  const filePath = process.argv[2] || './output/pension-flow.json';
  validateFlow(filePath).then(isValid => {
    process.exit(isValid ? 0 : 1);
  });
}

module.exports = validateFlow;
