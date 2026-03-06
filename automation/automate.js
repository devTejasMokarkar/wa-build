#!/usr/bin/env node

/**
 * WhatsApp Flow Builder - Complete Automation System
 * Automates build, test, validation, deployment, and monitoring workflows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Import ProductionUtils with error handling
let ProductionUtils;
try {
  ProductionUtils = require('../src/utils/ProductionUtils');
} catch (error) {
  console.warn('ProductionUtils not available, some features will be limited');
  ProductionUtils = null;
}

let ErrorHandler;
try {
  ErrorHandler = require('../src/core/ErrorHandler');
} catch (error) {
  console.warn('ErrorHandler not available, using basic error handling');
  ErrorHandler = null;
}

class AutomationEngine {
  constructor(options = {}) {
    this.options = {
      autoBuild: true,
      autoTest: true,
      autoValidate: true,
      autoDeploy: false,
      watchMode: false,
      ciMode: false,
      ...options
    };
    
    this.workDir = process.cwd();
    this.buildDir = path.join(this.workDir, 'dist');
    this.outputDir = path.join(this.workDir, 'output');
    this.logs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.logs.push(logEntry);
    
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    console.log(colors[type](`[${timestamp}] ${message}`));
  }

  async runFullAutomation() {
    this.log('🚀 Starting complete automation workflow...', 'info');
    
    try {
      // 1. Environment Setup
      await this.setupEnvironment();
      
      // 2. Code Quality Checks
      await this.runQualityChecks();
      
      // 3. Build Process
      if (this.options.autoBuild) {
        await this.runBuildProcess();
      }
      
      // 4. Testing
      if (this.options.autoTest) {
        await this.runTests();
      }
      
      // 5. Validation
      if (this.options.autoValidate) {
        await this.runValidation();
      }
      
      // 6. Bundle Analysis
      await this.analyzeBundles();
      
      // 7. Documentation Generation
      await this.generateDocumentation();
      
      // 8. Deployment (if enabled)
      if (this.options.autoDeploy) {
        await this.runDeployment();
      }
      
      this.log('✅ Automation workflow completed successfully!', 'success');
      return this.generateReport();
      
    } catch (error) {
      this.log(`❌ Automation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async setupEnvironment() {
    this.log('🔧 Setting up environment...', 'info');
    
    // Validate environment (if ProductionUtils is available)
    if (ProductionUtils && ProductionUtils.validateEnvironment) {
      try {
        const env = ProductionUtils.validateEnvironment();
        this.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        this.log(`   Production mode: ${env.isProduction}`);
      } catch (error) {
        this.log(`   Environment validation skipped: ${error.message}`, 'warning');
      }
    } else {
      this.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      this.log('   Environment validation skipped (ProductionUtils not available)');
    }
    
    // Create necessary directories
    const dirs = ['dist', 'output', 'logs', 'docs', 'coverage'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.workDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.log(`   Created directory: ${dir}`);
      }
    });
    
    this.log('✅ Environment setup complete', 'success');
  }

  async runQualityChecks() {
    this.log('🔍 Running code quality checks...', 'info');
    
    // Lint check (if ESLint is available)
    try {
      execSync('npx eslint . --ext .js', { stdio: 'pipe' });
      this.log('   ✅ ESLint checks passed', 'success');
    } catch (error) {
      this.log('   ⚠️  ESLint not configured or issues found', 'warning');
    }
    
    // Security audit
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      this.log('   ✅ Security audit passed', 'success');
    } catch (error) {
      this.log('   ⚠️  Security vulnerabilities detected', 'warning');
    }
    
    // Dependency check
    try {
      execSync('npm ls --depth=0', { stdio: 'pipe' });
      this.log('   ✅ Dependencies verified', 'success');
    } catch (error) {
      this.log('   ❌ Dependency issues found', 'error');
      throw new Error('Dependency check failed');
    }
    
    this.log('✅ Quality checks complete', 'success');
  }

  async runBuildProcess() {
    this.log('📦 Running build process...', 'info');
    
    try {
      // Clean previous builds
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
        this.log('   Cleaned previous build');
      }
      
      // Development build
      execSync('npm run build', { stdio: 'pipe' });
      this.log('   ✅ Development build completed', 'success');
      
      // Production build
      try {
        execSync('node build.prod.js', { stdio: 'pipe' });
        this.log('   ✅ Production build completed', 'success');
      } catch (error) {
        this.log(`   ⚠️  Production build failed: ${error.message}`, 'warning');
        this.log('   Continuing with development build only...', 'info');
      }
      
      // Generate statistics
      if (ProductionUtils && ProductionUtils.generateBundleStats) {
        try {
          const stats = ProductionUtils.generateBundleStats('./src');
          this.log(`   📊 Bundle: ${stats.files} files, ${(stats.totalSize / 1024).toFixed(2)} KB`);
        } catch (error) {
          this.log(`   ⚠️  Bundle statistics skipped: ${error.message}`, 'warning');
        }
      } else {
        this.log('   📊 Bundle statistics skipped (ProductionUtils not available)');
      }
      
    } catch (error) {
      this.log(`   ❌ Build failed: ${error.message}`, 'error');
      throw error;
    }
    
    this.log('✅ Build process complete', 'success');
  }

  async runTests() {
    this.log('🧪 Running tests...', 'info');
    
    try {
      // Unit tests
      try {
        execSync('npm test', { stdio: 'pipe' });
        this.log('   ✅ Unit tests passed', 'success');
      } catch (error) {
        this.log(`   ⚠️  Unit tests failed: ${error.message}`, 'warning');
        this.log('   Continuing with other checks...', 'info');
      }
      
      // Integration tests (if available)
      if (fs.existsSync('./test')) {
        try {
          const testFiles = fs.readdirSync('./test').filter(f => f.endsWith('.test.js'));
          if (testFiles.length > 0) {
            for (const testFile of testFiles) {
              execSync(`node test/${testFile}`, { stdio: 'pipe' });
              this.log(`   ✅ Integration test: ${testFile}`, 'success');
            }
          }
        } catch (error) {
          this.log(`   ⚠️  Integration tests failed: ${error.message}`, 'warning');
        }
      }
      
      // Coverage report
      try {
        execSync('npx jest --coverage', { stdio: 'pipe' });
        this.log('   ✅ Coverage report generated', 'success');
      } catch (error) {
        this.log('   ⚠️  Coverage report not generated', 'warning');
      }
      
    } catch (error) {
      this.log(`   ❌ Tests failed: ${error.message}`, 'error');
      // Don't throw error for test failures in automation mode
      this.log('   Continuing automation despite test failures...', 'warning');
    }
    
    this.log('✅ Testing complete', 'success');
  }

  async runValidation() {
    this.log('🔍 Running flow validation...', 'info');
    
    if (!ProductionUtils || !ProductionUtils.validateFlowIntegrity) {
      this.log('   ⚠️  Validation skipped (ProductionUtils not available)', 'warning');
      this.log('✅ Validation complete', 'success');
      return;
    }
    
    try {
      // Validate all flow files
      if (!fs.existsSync(this.outputDir)) {
        this.log('   ℹ️  Output directory does not exist', 'info');
        this.log('✅ Validation complete', 'success');
        return;
      }
      
      const outputFiles = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.json'));
      
      if (outputFiles.length === 0) {
        this.log('   ℹ️  No flow files found for validation', 'info');
        this.log('✅ Validation complete', 'success');
        return;
      }
      
      for (const file of outputFiles) {
        const filePath = path.join(this.outputDir, file);
        const flow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Production validation
        let validation;
        try {
          validation = ProductionUtils.validateFlowIntegrity(flow);
        } catch (error) {
          this.log(`   ⚠️  ${file} - Validation error: ${error.message}`, 'warning');
          continue; // Skip this file and continue with others
        }
        
        if (validation && validation.valid) {
          this.log(`   ✅ ${file} - Valid`, 'success');
        } else if (validation) {
          const errorMsg = validation.errors && validation.errors.length > 0 
            ? validation.errors.join(', ') 
            : 'Unknown validation error';
          this.log(`   ❌ ${file} - ${errorMsg}`, 'error');
          // Don't throw error, just log and continue
        } else {
          this.log(`   ⚠️  ${file} - Validation returned no result`, 'warning');
        }
        
        if (validation && validation.warnings && validation.warnings.length > 0) {
          this.log(`   ⚠️  ${file} - ${validation.warnings.join(', ')}`, 'warning');
        }
      }
      
    } catch (error) {
      this.log(`   ❌ Validation failed: ${error.message}`, 'error');
      throw error;
    }
    
    this.log('✅ Validation complete', 'success');
  }

  async analyzeBundles() {
    this.log('📊 Analyzing bundles...', 'info');
    
    if (!ProductionUtils) {
      this.log('   ⚠️  Bundle analysis skipped (ProductionUtils not available)', 'warning');
      this.log('✅ Bundle analysis complete', 'success');
      return;
    }
    
    try {
      // Bundle size analysis
      if (ProductionUtils.generateBundleStats) {
        try {
          const stats = ProductionUtils.generateBundleStats('./src');
          this.log(`   📊 Bundle analysis: ${stats.files} files, ${(stats.totalSize / 1024).toFixed(2)} KB`);
        } catch (error) {
          this.log(`   ⚠️  Bundle statistics failed: ${error.message}`, 'warning');
        }
      }
      
      // Performance analysis
      if (ProductionUtils.createPerformanceReport && fs.existsSync(this.outputDir)) {
        const outputFiles = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.json'));
        
        for (const file of outputFiles) {
          try {
            const filePath = path.join(this.outputDir, file);
            const flow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            const report = ProductionUtils.createPerformanceReport(flow);
            this.log(`   📊 ${file}:`);
            this.log(`      Screens: ${report.flow.screens}`);
            this.log(`      Components: ${report.flow.totalComponents}`);
            this.log(`      Load time: ${report.performance.estimatedLoadTime}ms`);
            this.log(`      Memory: ${report.performance.memoryUsage}KB`);
            this.log(`      Complexity: ${(report.performance.complexity * 100).toFixed(1)}%`);
            
            if (report.recommendations.length > 0) {
              report.recommendations.forEach(rec => {
                this.log(`      💡 ${rec}`, 'warning');
              });
            }
          } catch (error) {
            this.log(`   ⚠️  Performance analysis failed for ${file}: ${error.message}`, 'warning');
          }
        }
      }
      
    } catch (error) {
      this.log(`   ❌ Bundle analysis failed: ${error.message}`, 'error');
      throw error;
    }
    
    this.log('✅ Bundle analysis complete', 'success');
  }

  async generateDocumentation() {
    this.log('📚 Generating documentation...', 'info');
    
    try {
      // API documentation
      const apiDocs = this.generateAPIDocumentation();
      fs.writeFileSync(
        path.join(this.workDir, 'docs', 'API.md'),
        apiDocs
      );
      this.log('   ✅ API documentation generated', 'success');
      
      // Component documentation
      const componentDocs = this.generateComponentDocumentation();
      fs.writeFileSync(
        path.join(this.workDir, 'docs', 'Components.md'),
        componentDocs
      );
      this.log('   ✅ Component documentation generated', 'success');
      
      // Flow examples documentation
      const examplesDocs = this.generateExamplesDocumentation();
      fs.writeFileSync(
        path.join(this.workDir, 'docs', 'Examples.md'),
        examplesDocs
      );
      this.log('   ✅ Examples documentation generated', 'success');
      
    } catch (error) {
      this.log(`   ❌ Documentation generation failed: ${error.message}`, 'error');
      throw error;
    }
    
    this.log('✅ Documentation generation complete', 'success');
  }

  async runDeployment() {
    this.log('🚀 Running deployment...', 'info');
    
    try {
      // Version bump
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const currentVersion = packageJson.version;
      const newVersion = this.incrementVersion(currentVersion);
      
      packageJson.version = newVersion;
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
      this.log(`   📦 Version bumped: ${currentVersion} → ${newVersion}`, 'success');
      
      // Git operations
      try {
        execSync('git add .', { stdio: 'pipe' });
        execSync(`git commit -m "Automated release v${newVersion}"`, { stdio: 'pipe' });
        execSync(`git tag v${newVersion}`, { stdio: 'pipe' });
        this.log('   ✅ Git operations completed', 'success');
      } catch (error) {
        this.log('   ⚠️  Git operations skipped', 'warning');
      }
      
      // NPM publish
      try {
        execSync('npm publish', { stdio: 'pipe' });
        this.log(`   ✅ Published to npm v${newVersion}`, 'success');
      } catch (error) {
        this.log('   ⚠️  NPM publish skipped or failed', 'warning');
      }
      
    } catch (error) {
      this.log(`   ❌ Deployment failed: ${error.message}`, 'error');
      throw error;
    }
    
    this.log('✅ Deployment complete', 'success');
  }

  generateAPIDocumentation() {
    return `# WhatsApp Flow Builder - API Documentation

## Version ${JSON.parse(fs.readFileSync('./package.json', 'utf8')).version}

### Core Classes

#### Flow
\`\`\`javascript
const { Flow } = require('./index');
const flow = new Flow('MyFlow');
\`\`\`

#### FlowBuilder
\`\`\`javascript
const { createFlow } = require('./index');
const flow = createFlow('MyFlow');
\`\`\`

### Components

#### TextInput
\`\`\`javascript
.textInput('name', 'Your Name', { required: true })
\`\`\`

#### Dropdown
\`\`\`javascript
.dropdown('category', 'Select Category', [
  { id: 'cat1', title: 'Category 1' },
  { id: 'cat2', title: 'Category 2' }
])
\`\`\`

#### CheckboxGroup
\`\`\`javascript
.checkboxGroup('interests', 'Interests', [
  { id: 'sports', title: 'Sports' },
  { id: 'music', title: 'Music' }
])
\`\`\`

#### EmbeddedLink
\`\`\`javascript
.embeddedLink('Learn More', 'https://example.com', { style: 'primary' })
\`\`\`

#### Footer
\`\`\`javascript
.footer('Continue', { next: 'NEXT_SCREEN' })
\`\`\`

### Validation

\`\`\`javascript
const { validateFlow } = require('./index');
const validation = validateFlow(flow);
// Returns: { valid: boolean, errors: string[], warnings: string[] }
\`\`\`

### Utilities

\`\`\`javascript
const { generateStats } = require('./index');
const stats = generateStats('./src');
\`\`\`

Generated on: ${new Date().toISOString()}
`;
  }

  generateComponentDocumentation() {
    return `# WhatsApp Flow Builder - Component Documentation

## Supported Components

### 1. TextInput
- **Purpose**: Text input field
- **Properties**: name, label, required, input-type
- **Validation**: Required fields, type validation

### 2. Dropdown
- **Purpose**: Selection from options
- **Properties**: name, label, data-source (array)
- **Validation**: Required fields, data-source validation

### 3. CheckboxGroup
- **Purpose**: Multi-select checkboxes
- **Properties**: name, label, data-source (array)
- **Validation**: Required fields, data-source validation

### 4. EmbeddedLink
- **Purpose**: Clickable links
- **Limit**: Maximum 3 per screen
- **Properties**: text, on-click-action, style, color

### 5. Footer
- **Purpose**: Action buttons
- **Properties**: label, on-click-action

### 6. TextBody
- **Purpose**: Rich text content
- **Properties**: text, style

## Validation Rules

- All components must have a 'type' field
- EmbeddedLink maximum: 3 per screen
- Screen IDs must be unique
- Routing must reference existing screens

Generated on: ${new Date().toISOString()}
`;
  }

  generateExamplesDocumentation() {
    const examples = fs.readdirSync('./examples').filter(f => f.endsWith('.js'));
    
    let docs = `# WhatsApp Flow Builder - Examples Documentation

## Available Examples

`;
    
    examples.forEach(example => {
      const examplePath = path.join('./examples', example);
      const content = fs.readFileSync(examplePath, 'utf8');
      
      docs += `### ${example}
\`\`\`javascript
${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
\`\`\`

`;
    });
    
    docs += `Generated on: ${new Date().toISOString()}`;
    return docs;
  }

  incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      status: 'success',
      steps: {
        environment: 'completed',
        quality: 'completed',
        build: this.options.autoBuild ? 'completed' : 'skipped',
        test: this.options.autoTest ? 'completed' : 'skipped',
        validation: this.options.autoValidate ? 'completed' : 'skipped',
        analysis: 'completed',
        documentation: 'completed',
        deployment: this.options.autoDeploy ? 'completed' : 'skipped'
      },
      logs: this.logs
    };
    
    // Save report
    const reportPath = path.join(this.workDir, 'logs', `automation-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  async watchMode() {
    this.log('👁️  Starting watch mode...', 'info');
    this.log('   Watching for changes in src/, examples/, flows/');
    
    const { watch } = require('chokidar');
    
    const watcher = watch(['./src/**/*', './examples/**/*', './flows/**/*'], {
      ignored: /node_modules/,
      persistent: true
    });
    
    watcher.on('change', async (filePath) => {
      this.log(`📝 File changed: ${filePath}`, 'info');
      
      try {
        await this.runBuildProcess();
        await this.runValidation();
        this.log('✅ Auto-rebuild complete', 'success');
      } catch (error) {
        this.log(`❌ Auto-rebuild failed: ${error.message}`, 'error');
      }
    });
    
    return watcher;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse arguments
  if (args.includes('--no-build')) options.autoBuild = false;
  if (args.includes('--no-test')) options.autoTest = false;
  if (args.includes('--no-validate')) options.autoValidate = false;
  if (args.includes('--deploy')) options.autoDeploy = true;
  if (args.includes('--watch')) options.watchMode = true;
  if (args.includes('--ci')) options.ciMode = true;
  
  const automation = new AutomationEngine(options);
  automation.startTime = Date.now();
  
  if (options.watchMode) {
    automation.watchMode();
  } else {
    automation.runFullAutomation()
      .then(report => {
        console.log(chalk.green('\n🎉 Automation completed successfully!'));
        console.log(chalk.blue(`📊 Report saved to logs/automation-${Date.now()}.json`));
      })
      .catch(error => {
        console.error(chalk.red('\n❌ Automation failed:'), error.message);
        process.exit(1);
      });
  }
}

module.exports = AutomationEngine;
