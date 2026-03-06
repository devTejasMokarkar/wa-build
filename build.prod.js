#!/usr/bin/env node

/**
 * Production build script for WhatsApp Flow Builder
 * Optimizes code, validates flows, and creates production-ready bundles
 */

const fs = require('fs');
const path = require('path');
const { ProductionUtils } = require('./src/utils/ProductionUtils');
const { ErrorHandler } = require('./src/core/ErrorHandler');

class ProductionBuilder {
  constructor() {
    this.buildDir = './dist';
    this.sourceDir = './src';
    this.options = {
      minify: true,
      validate: true,
      generateStats: true
    };
  }

  async build() {
    console.log('🚀 Starting production build...\n');

    try {
      // Validate environment
      console.log('📋 Validating environment...');
      const env = ProductionUtils.validateEnvironment();
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Production mode: ${env.isProduction}\n`);

      // Generate bundle statistics
      if (this.options.generateStats) {
        console.log('📊 Analyzing bundle...');
        ProductionUtils.generateBundleStats(this.sourceDir);
        console.log('');
      }

      // Create production build
      console.log('📦 Creating production build...');
      const buildPath = ProductionUtils.createProductionBuild(this.buildDir);
      console.log('');

      // Copy source files
      console.log('📁 Copying source files...');
      this.copySourceFiles(buildPath);
      console.log('');

      // Validate test flows
      if (this.options.validate) {
        console.log('✅ Validating flows...');
        await this.validateTestFlows();
        console.log('');
      }

      // Generate build report
      console.log('📄 Generating build report...');
      await this.generateBuildReport(buildPath);
      console.log('');

      console.log('✅ Production build completed successfully!');
      console.log(`📂 Build location: ${path.resolve(buildPath)}`);

    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  copySourceFiles(buildPath) {
    const srcDistPath = path.join(buildPath, 'src');
    
    // Copy src directory
    this.copyDirectory('./src', srcDistPath);
    
    // Copy index.js
    if (fs.existsSync('./index.js')) {
      fs.copyFileSync('./index.js', path.join(buildPath, 'index.js'));
    }

    // Copy examples
    if (fs.existsSync('./examples')) {
      this.copyDirectory('./examples', path.join(buildPath, 'examples'));
    }

    console.log('   ✓ Source files copied');
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  async validateTestFlows() {
    const testFlowsDir = './flows';
    
    if (!fs.existsSync(testFlowsDir)) {
      console.log('   ⚠️ No test flows directory found');
      return;
    }

    const flowFiles = fs.readdirSync(testFlowsDir).filter(file => file.endsWith('.flow.js'));
    
    for (const file of flowFiles) {
      const filePath = path.join(testFlowsDir, file);
      try {
        // Execute flow file to get flow object
        delete require.cache[require.resolve(filePath)];
        const flowModule = require(filePath);
        const flow = flowModule.default || flowModule;

        // Validate flow integrity
        const validation = ProductionUtils.validateFlowIntegrity(flow);
        
        if (validation.valid) {
          console.log(`   ✓ ${file} - Valid`);
        } else {
          console.log(`   ❌ ${file} - Errors: ${validation.errors.join(', ')}`);
        }

        if (validation.warnings.length > 0) {
          console.log(`   ⚠️ ${file} - Warnings: ${validation.warnings.join(', ')}`);
        }

        // Generate performance report
        const perfReport = ProductionUtils.createPerformanceReport(flow);
        if (perfReport.recommendations.length > 0) {
          console.log(`   💡 ${file} - Recommendations: ${perfReport.recommendations.join(', ')}`);
        }

      } catch (error) {
        console.log(`   ❌ ${file} - Failed to load: ${error.message}`);
      }
    }
  }

  async generateBuildReport(buildPath) {
    const report = {
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development',
      buildOptions: this.options,
      files: this.getBuildFileList(buildPath),
      size: this.getBuildSize(buildPath)
    };

    const reportPath = path.join(buildPath, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   ✓ Build report generated: ${reportPath}`);
  }

  getBuildFileList(buildPath) {
    const files = [];
    
    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath, relativeItemPath);
        } else {
          files.push({
            path: relativeItemPath,
            size: stat.size,
            modified: stat.mtime.toISOString()
          });
        }
      });
    };

    scanDirectory(buildPath);
    return files;
  }

  getBuildSize(buildPath) {
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          calculateSize(itemPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      });
    };

    calculateSize(buildPath);
    
    return {
      totalBytes: totalSize,
      totalKB: Math.round(totalSize / 1024),
      totalMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      fileCount
    };
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }
}

// CLI interface
if (require.main === module) {
  const builder = new ProductionBuilder();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--no-minify')) {
    builder.setOptions({ minify: false });
  }
  
  if (args.includes('--no-validate')) {
    builder.setOptions({ validate: false });
  }
  
  if (args.includes('--no-stats')) {
    builder.setOptions({ generateStats: false });
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node build.prod.js [options]

Options:
  --no-minify     Disable minification
  --no-validate    Skip flow validation
  --no-stats       Skip bundle statistics
  --help, -h       Show this help message

Environment Variables:
  NODE_ENV         Set to 'production' for production build
    `);
    process.exit(0);
  }

  // Set production environment if not specified
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  // Run build
  builder.build();
}

module.exports = ProductionBuilder;
