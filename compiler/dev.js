const { createFlow } = require('../src/core/FlowBuilder');
const OptimizedBuilder = require('./build-optimized');
const LocalPreviewGenerator = require('../src/preview/LocalPreviewGenerator');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

class DevServer {
  constructor() {
    this.optimizedBuilder = new OptimizedBuilder();
    this.previewGenerator = new LocalPreviewGenerator();
    this.watchFiles = [];
    this.isWatching = false;
  }

  async start() {
    console.log(chalk.blue('🔧 Starting WhatsApp Flow Dev Server...'));
    
    // Create example flow using optimized builder
    await this.createDemoFlow();
    
    // Generate and open preview
    await this.generatePreview();
    
    // Start file watching
    this.startWatching();
    
    console.log(chalk.green('✅ Dev server started!'));
    console.log(chalk.cyan('📁 Watching for changes in src/ directory'));
    console.log(chalk.cyan('🔄 Auto-rebuild on file changes'));
    console.log(chalk.cyan('🎨 Auto-preview on changes'));
  }

  async createDemoFlow() {
    try {
      console.log(chalk.blue('📝 Creating demo flow with optimized builder...'));
      
      // Use the optimized builder which handles routing_model automatically
      await this.optimizedBuilder.build();
      
      console.log(chalk.green('📝 Demo flow created successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to create demo flow:'), error.message);
    }
  }

  async generatePreview() {
    try {
      console.log(chalk.blue('🎨 Generating flow preview...'));
      
      // Find the latest flow file by modification time, excluding symlinks
      const flowFiles = fs.readdirSync('./output')
        .filter(file => file.endsWith('.json') && !file.includes('minified') && file !== 'latest-flow.json')
        .map(file => ({
          name: file,
          path: path.join('./output', file),
          mtime: fs.statSync(path.join('./output', file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (flowFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No flow files found for preview'));
        return;
      }

      const latestFlow = flowFiles[0];
      console.log(chalk.cyan(`📁 Using flow file: ${latestFlow.path}`));
      console.log(chalk.cyan(`📅 Modified: ${latestFlow.mtime.toISOString()}`));
      
      const flowData = JSON.parse(fs.readFileSync(latestFlow.path, 'utf8'));
      
      // Generate interactive preview
      const previewResult = this.previewGenerator.generatePreview(flowData, {
        interactive: true,
        debug: false
      });

      console.log(chalk.green('✅ Preview generated!'));
      console.log(chalk.cyan(`🌐 Preview URL: ${previewResult.previewUrl}`));
      
      // Auto-open browser
      this.openBrowser(previewResult.previewUrl);
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate preview:'), error.message);
      console.error(chalk.red('Stack:'), error.stack);
    }
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

  startWatching() {
    const watchDir = './src';
    
    if (!fs.existsSync(watchDir)) {
      console.log(chalk.yellow('⚠️  src/ directory not found, skipping watch mode'));
      return;
    }

    fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.js') || filename.endsWith('.json'))) {
        console.log(chalk.yellow(`🔄 File changed: ${filename}`));
        this.rebuildFlow();
      }
    });

    this.isWatching = true;
  }

  async rebuildFlow() {
    try {
      console.log(chalk.blue('🔨 Rebuilding flow...'));
      await this.createDemoFlow();
      await this.generatePreview();
      console.log(chalk.green('✅ Flow rebuilt and preview updated'));
    } catch (error) {
      console.error(chalk.red('❌ Rebuild failed:'), error.message);
    }
  }

  stop() {
    this.isWatching = false;
    console.log(chalk.yellow('🛑 Dev server stopped'));
  }
}

// Start dev server
if (require.main === module) {
  const server = new DevServer();
  server.start().catch(console.error);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
  });
}

module.exports = DevServer;
