#!/usr/bin/env node

/**
 * Optimized Flow Builder - Build, Validate, and Generate Valid JSON
 * Only outputs valid flows, validates on save, reduces commands
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { createFlow } = require('../index');
const Validator = require('../src/core/Validator');

class OptimizedBuilder {
  constructor() {
    this.outputDir = './output';
    this.versionsDir = './output/versions';
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    console.log(colors[type](`🔧 ${message}`));
  }

  async build() {
    this.log('Starting optimized flow build...', 'info');

    try {
      // Ensure output directories exist
      this.ensureDirectories();

      // Build the flow
      const flow = this.createFlow();
      if (!flow) {
        throw new Error('Failed to create flow');
      }

      // Build and validate
      const builtFlow = flow.build();
      if (!builtFlow) {
        throw new Error('Failed to build flow');
      }

      // Build routing model based on screen navigation actions BEFORE validation
      if (builtFlow.data_api_version === "3.0") {
        const routingModel = {};
        
        builtFlow.screens.forEach(screen => {
          const navigableScreens = [];
          
          // Check footer navigation actions
          screen.layout?.children?.forEach(component => {
            if (component.type === "Footer" && component["on-click-action"]) {
              const action = component["on-click-action"];
              if (action.name === "navigate" && action.next && action.next.name) {
                navigableScreens.push(action.next.name);
              }
            }
          });
          
          if (navigableScreens.length > 0) {
            routingModel[screen.id] = navigableScreens;
          }
        });
        
        builtFlow.routing_model = routingModel;
        this.log(`Added routing_model with connections: ${JSON.stringify(routingModel)}`, 'info');
      }

      // Validate before saving
      const validator = new Validator();
      const validation = validator.validateFlow(builtFlow);
      if (validation.length > 0) {
        this.log('Flow validation failed:', 'error');
        validation.forEach(error => this.log(`  ❌ ${error}`, 'error'));
        throw new Error(`Flow validation failed: ${validation.join(', ')}`);
      }

      // Save only valid flows
      await this.saveValidatedFlow(builtFlow);
      
      // Show statistics
      this.showStatistics(builtFlow);
      
      this.log('✅ Flow built and validated successfully!', 'success');
      return builtFlow;

    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  createFlow() {
    this.log('Creating WhatsApp flow...', 'info');
    
    const flow = createFlow("SERVICES")
      .screen("SERVICES", { title: "Services Selection" })
      .add({ type: "TextBody", text: "Please select the services you need" })
      .add({ 
        type: "Dropdown", 
        name: "OServiceCategory", 
        label: "Select Service Category",
        "data-source": [
          { id: "pension", title: "Pension Services" },
          { id: "insurance", title: "Insurance Services" },
          { id: "investment", title: "Investment Services" }
        ]
      })
      .footer("Continue", "navigate", "CONFIRMATION")
      
      // Add terminal screen for compliance
      .screen("CONFIRMATION", { title: "Confirmation", terminal: true })
      .add({ type: "TextBody", text: "Thank you for your selection. Your request has been submitted." })
      .footer("Complete", "complete");

    return flow;
  }

  async saveValidatedFlow(builtFlow) {
    this.log('Saving validated flow...', 'info');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseFilename = `services-flow-${timestamp}`;
    
    // Save main flow file (clean, without metadata)
    const mainFile = path.join(this.outputDir, `${baseFilename}.json`);
    fs.writeFileSync(mainFile, JSON.stringify(builtFlow, null, 2));
    this.log(`✓ Flow saved to: ${mainFile}`, 'success');

    // Save versioned copy
    const versionFile = path.join(this.versionsDir, `${baseFilename}.json`);
    fs.writeFileSync(versionFile, JSON.stringify(builtFlow, null, 2));
    this.log(`📦 Version saved: ${versionFile}`, 'success');

    // Create minified version
    const minifiedFile = path.join(this.outputDir, `${baseFilename}-minified.json`);
    fs.writeFileSync(minifiedFile, JSON.stringify(builtFlow));
    this.log(`📄 Minified saved: ${minifiedFile}`, 'success');

    // Update latest symlink
    const latestFile = path.join(this.outputDir, 'latest-flow.json');
    if (fs.existsSync(latestFile)) {
      try {
        fs.unlinkSync(latestFile);
      } catch (error) {
        // Ignore symlink removal errors
      }
    }
    try {
      fs.symlinkSync(mainFile, latestFile);
      this.log(`🔗 Latest symlink: ${latestFile}`, 'success');
    } catch (error) {
      // Ignore symlink creation errors
      this.log(`⚠️  Could not create latest symlink: ${error.message}`, 'warning');
    }
  }

  ensureDirectories() {
    [this.outputDir, this.versionsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`, 'info');
      }
    });
  }

  showStatistics(flow) {
    this.log('📊 Flow Statistics:', 'info');
    
    const stats = {
      totalScreens: flow.screens?.length || 0,
      terminalScreens: flow.screens?.filter(s => s.terminal).length || 0,
      totalComponents: flow.screens?.reduce((sum, screen) => 
        sum + (screen.layout?.children?.length || 0), 0) || 0,
      hasRouting: !!(flow.routing_model && Object.keys(flow.routing_model).length > 0),
      routingConditions: Object.keys(flow.routing_model || {}).length
    };

    console.log(`  Total Screens: ${stats.totalScreens}`);
    console.log(`  Terminal Screens: ${stats.terminalScreens}`);
    console.log(`  Total Components: ${stats.totalComponents}`);
    console.log(`  Has Routing: ${stats.hasRouting ? 'Yes' : 'No'}`);
    if (stats.hasRouting) {
      console.log(`  Routing Conditions: ${stats.routingConditions}`);
    }

    // Component breakdown
    const componentTypes = {};
    flow.screens?.forEach(screen => {
      screen.layout?.children?.forEach(component => {
        componentTypes[component.type] = (componentTypes[component.type] || 0) + 1;
      });
    });

    if (Object.keys(componentTypes).length > 0) {
      console.log('\n📋 Component Types:');
      Object.entries(componentTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }
  }

  // Quick validation method for existing files
  static async validateExistingFile(filePath) {
    console.log(chalk.blue('🔍 Validating existing flow...'));
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`❌ File not found: ${filePath}`));
        return false;
      }

      const flow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const validator = new Validator();
      const validation = validator.validateFlow(flow);

      if (validation.length === 0) {
        console.log(chalk.green('✅ Flow is valid!'));
        return true;
      } else {
        console.log(chalk.red('❌ Flow validation failed:'));
        validation.forEach(error => 
          console.log(chalk.red(`  ${error}`))
        );
        return false;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Validation error: ${error.message}`));
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const builder = new OptimizedBuilder();

  // Check if validating existing file
  if (args.includes('--validate') && args[1] && args[1] !== '--validate') {
    const filePath = args[1];
    OptimizedBuilder.validateExistingFile(filePath);
    return;
  }

  // Build new flow
  builder.build();
}

module.exports = OptimizedBuilder;
