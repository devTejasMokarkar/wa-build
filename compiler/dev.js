const { createFlow } = require('../src/core/FlowBuilder');
const Compiler = require('../src/core/Compiler');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

class DevServer {
  constructor() {
    this.compiler = new Compiler({
      outputDir: './output',
      versioning: false,
      validate: true
    });
    this.watchFiles = [];
    this.isWatching = false;
  }

  async start() {
    console.log(chalk.blue('🔧 Starting WhatsApp Flow Dev Server...'));
    
    // Create example flow
    await this.createDemoFlow();
    
    // Start file watching
    this.startWatching();
    
    console.log(chalk.green('✅ Dev server started!'));
    console.log(chalk.cyan('📁 Watching for changes in src/ directory'));
    console.log(chalk.cyan('🔄 Auto-rebuild on file changes'));
  }

  async createDemoFlow() {
    const flow = createFlow('DemoFlow', {
      version: '1.0.0',
      dataApiVersion: '3.0'
    });

    flow
      .screen('LOGIN', { title: 'Login' })
      .text('username', 'Username', { required: true })
      .password('password', 'Password', { required: true })
      .submit('Login')
      .screen('DASHBOARD', { title: 'Dashboard' })
      .text('search', 'Search...', { required: false })
      .dropdown('category', 'Category', [
        { id: 'all', title: 'All Categories' },
        { id: 'documents', title: 'Documents' },
        { id: 'payments', title: 'Payments' },
        { id: 'services', title: 'Services' }
      ])
      .next('Continue', 'RESULTS')
      .screen('RESULTS', { title: 'Search Results', terminal: true });

    try {
      flow.validate();
      const builtFlow = flow.build();
      await this.compiler.saveToFile(builtFlow, 'demo-flow');
      
      console.log(chalk.green('📝 Demo flow created'));
      this.compiler.printStats(builtFlow);
    } catch (error) {
      console.error(chalk.red('❌ Failed to create demo flow:'), error.message);
    }
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
      console.log(chalk.green('✅ Flow rebuilt successfully'));
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
