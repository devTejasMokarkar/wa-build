#!/usr/bin/env node

/**
 * WhatsApp Flow Preview Generator
 * Creates local web previews for WhatsApp flows
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const LocalPreviewGenerator = require('../src/preview/LocalPreviewGenerator');

class PreviewCLI {
  constructor() {
    this.generator = new LocalPreviewGenerator();
  }

  async run(args = []) {
    const options = this.parseArgs(args);
    
    try {
      // Read flow JSON
      const flowJson = this.readFlowFile(options.flowFile);
      
      if (!flowJson) {
        console.log(chalk.red('❌ Failed to read flow file'));
        process.exit(1);
      }

      // Generate preview
      const result = this.generator.generatePreview(flowJson, {
        interactive: options.interactive,
        flowAction: options.flowAction,
        flowActionPayload: options.flowActionPayload,
        phoneNumber: options.phoneNumber,
        debug: options.debug
      });

      // Display results
      this.displayResults(result, options);

      // Auto-open browser if requested
      if (options.open) {
        this.openBrowser(result.previewUrl);
      }

    } catch (error) {
      console.log(chalk.red(`❌ Preview generation failed: ${error.message}`));
      process.exit(1);
    }
  }

  parseArgs(args) {
    const options = {
      flowFile: null,
      interactive: false,
      flowAction: 'navigate',
      flowActionPayload: null,
      phoneNumber: null,
      debug: false,
      open: false
    };

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--interactive':
        case '-i':
          options.interactive = true;
          break;
        case '--debug':
        case '-d':
          options.debug = true;
          break;
        case '--open':
        case '-o':
          options.open = true;
          break;
        case '--flow-action':
          options.flowAction = args[++i];
          break;
        case '--flow-action-payload':
          options.flowActionPayload = args[++i];
          break;
        case '--phone-number':
          options.phoneNumber = args[++i];
          break;
        default:
          if (!options.flowFile) {
            options.flowFile = arg;
          }
          break;
      }
    }

    // Default to latest flow if no file specified
    if (!options.flowFile) {
      options.flowFile = this.findLatestFlow();
    }

    return options;
  }

  readFlowFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`❌ File not found: ${filePath}`));
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.log(chalk.red(`❌ Error reading file: ${error.message}`));
      return null;
    }
  }

  findLatestFlow() {
    const outputDir = './output';
    
    if (!fs.existsSync(outputDir)) {
      console.log(chalk.red('❌ Output directory not found'));
      return null;
    }

    const files = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.json') && !file.includes('minified'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(outputDir, a));
        const statB = fs.statSync(path.join(outputDir, b));
        return statB.mtime - statA.mtime;
      });

    return files.length > 0 ? path.join(outputDir, files[0]) : null;
  }

  displayResults(result, options) {
    console.log(chalk.green('\n🎉 Preview Generated Successfully!'));
    console.log(chalk.blue('\n📱 Preview Information:'));
    console.log(`   File: ${result.previewFile}`);
    console.log(`   URL: ${result.previewUrl}`);
    console.log(`   Expires: ${result.expiresAt}`);
    
    console.log(chalk.blue('\n⚙️  Preview Options:'));
    console.log(`   Interactive: ${options.interactive ? '✅ Yes' : '❌ No'}`);
    console.log(`   Debug Mode: ${options.debug ? '✅ Yes' : '❌ No'}`);
    console.log(`   Flow Action: ${options.flowAction}`);
    
    if (options.interactive) {
      console.log(chalk.yellow('\n🎮 Interactive Features:'));
      console.log('   • Form inputs are functional');
      console.log('   • Navigation buttons work');
      console.log('   • Data collection enabled');
      console.log('   • Debug panel available');
    }
    
    console.log(chalk.blue('\n🌐 How to View:'));
    console.log('   1. Open the HTML file in your browser');
    console.log('   2. Or use the file:// URL above');
    
    if (!options.open) {
      console.log(chalk.yellow('\n💡 Tip: Use --open flag to auto-open browser'));
    }
    
    console.log(chalk.green('\n✨ Preview is ready for testing!'));
  }

  openBrowser(url) {
    const { exec } = require('child_process');
    const platform = process.platform;
    
    let command;
    switch (platform) {
      case 'darwin':  // macOS
        command = `open "${url}"`;
        break;
      case 'win32':   // Windows
        command = `start "" "${url}"`;
        break;
      default:        // Linux
        command = `xdg-open "${url}"`;
        break;
    }

    exec(command, (error) => {
      if (error) {
        console.log(chalk.yellow(`⚠️  Could not open browser automatically: ${error.message}`));
        console.log(chalk.blue(`Please open manually: ${url}`));
      } else {
        console.log(chalk.green('🌐 Opened preview in browser'));
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const cli = new PreviewCLI();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(chalk.blue('🎨 WhatsApp Flow Preview Generator\n'));
    console.log('Usage:');
    console.log('  node compiler/preview.js [flow-file] [options]\n');
    console.log('Options:');
    console.log('  -i, --interactive          Enable interactive mode');
    console.log('  -d, --debug               Enable debug panel');
    console.log('  -o, --open                Auto-open browser');
    console.log('  --flow-action <action>     Initial flow action (navigate/data_exchange)');
    console.log('  --flow-action-payload <json> Initial flow data (JSON string)');
    console.log('  --phone-number <number>    Phone number for endpoint flows');
    console.log('  -h, --help                 Show this help\n');
    console.log('Examples:');
    console.log('  node compiler/preview.js                                    # Use latest flow');
    console.log('  node compiler/preview.js ./output/flow.json                # Specific file');
    console.log('  node compiler/preview.js --interactive --debug             # Interactive with debug');
    console.log('  node compiler/preview.js --interactive --open              # Interactive and auto-open');
    console.log('  node compiler/preview.js --flow-action navigate --flow-action-payload \'{"screen":"FIRST"}\'');
    process.exit(0);
  }
  
  cli.run(args);
}

module.exports = PreviewCLI;
