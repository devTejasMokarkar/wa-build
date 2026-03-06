const { createFlow } = require('../src/core/FlowBuilder');
const OptimizedBuilder = require('./build-optimized');
const LocalPreviewGenerator = require('../src/preview/LocalPreviewGenerator');
const fs = require('fs-extra');
const path = require('path');

class DevServer {
  constructor() {
    this.optimizedBuilder = new OptimizedBuilder();
    this.previewGenerator = new LocalPreviewGenerator();
    this.watchFiles = [];
    this.isWatching = false;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m'    // red
    };
    
    const reset = '\x1b[0m';
    const color = colors[type] || colors.info;
    console.log(`${color}[DEV] ${message}${reset}`);
  }

  async start() {
    this.log('Starting WhatsApp Flow Dev Server', 'info');
    
    // Create example flow using optimized builder
    await this.createDemoFlow();
    
    // Generate and open preview
    await this.generatePreview();
    
    // Start file watching
    this.startWatching();
    
    this.log('Dev server started', 'success');
    this.log('Watching for changes in src/ directory', 'info');
    this.log('Auto-rebuild on file changes', 'info');
    this.log('Auto-preview on changes', 'info');
  }

  async createDemoFlow() {
    try {
      this.log('Creating demo flow with optimized builder', 'info');
      
      // Use the optimized builder which handles routing_model automatically
      await this.optimizedBuilder.build();
      
      this.log('Demo flow created successfully', 'success');
    } catch (error) {
      this.log(`Failed to create demo flow: ${error.message}`, 'error');
    }
  }

  async generatePreview() {
    try {
      this.log('Generating flow preview', 'info');
      
      // Use the main flow file (services-flow.json)
      const flowFile = path.join('./output', 'services-flow.json');
      
      if (!fs.existsSync(flowFile)) {
        this.log('No flow file found for preview', 'warning');
        return;
      }

      this.log(`Using flow file: ${flowFile}`, 'info');
      
      const flowData = JSON.parse(fs.readFileSync(flowFile, 'utf8'));
      
      // Generate interactive preview
      const previewResult = this.previewGenerator.generatePreview(flowData, {
        interactive: true,
        debug: false
      });

      this.log('Preview generated', 'success');
      this.log(`Preview URL: ${previewResult.previewUrl}`, 'info');
      
      // Auto-open browser
      this.openBrowser(previewResult.previewUrl);
      
    } catch (error) {
      this.log(`Failed to generate preview: ${error.message}`, 'error');
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
        this.log(`Could not open browser automatically: ${error.message}`, 'warning');
        this.log(`Please open manually: ${url}`, 'info');
      } else {
        this.log('Opened preview in browser', 'success');
      }
    });
  }

  startWatching() {
    const watchDir = './src';
    
    if (!fs.existsSync(watchDir)) {
      this.log('src/ directory not found, skipping watch mode', 'warning');
      return;
    }

    fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.js') || filename.endsWith('.json'))) {
        this.log(`File changed: ${filename}`, 'info');
        this.rebuildFlow();
      }
    });

    this.isWatching = true;
  }

  async rebuildFlow() {
    try {
      this.log('Rebuilding flow', 'info');
      await this.createDemoFlow();
      await this.generatePreview();
      this.log('Flow rebuilt and preview updated', 'success');
    } catch (error) {
      this.log(`Rebuild failed: ${error.message}`, 'error');
    }
  }

  stop() {
    this.isWatching = false;
    this.log('Dev server stopped', 'warning');
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
