const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class Compiler {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './output',
      minify: options.minify || false,
      validate: options.validate !== false,
      versioning: options.versioning || false,
      ...options
    };
  }

  compile(flow) {
    const compiledFlow = {
      ...flow,
      compiled_at: new Date().toISOString(),
      compiled_by: 'wa-flow-builder v2.0.0'
    };

    if (this.options.minify) {
      return this.minify(compiledFlow);
    }

    return compiledFlow;
  }

  minify(flow) {
    return JSON.parse(JSON.stringify(flow));
  }

  async saveToFile(flow, filename, version = null) {
    await fs.ensureDir(this.options.outputDir);
    
    const baseName = version ? `${filename}-v${version}` : filename;
    const filePath = path.join(this.options.outputDir, `${baseName}.json`);
    
    const compiledFlow = this.compile(flow);
    const content = this.options.minify 
      ? JSON.stringify(compiledFlow)
      : JSON.stringify(compiledFlow, null, 2);

    await fs.writeFile(filePath, content, 'utf8');
    
    console.log(chalk.green(`✓ Flow saved to: ${filePath}`));
    
    if (this.options.versioning && version) {
      await this.saveVersion(flow, filename, version);
    }

    return filePath;
  }

  async saveVersion(flow, filename, version) {
    const versionsDir = path.join(this.options.outputDir, 'versions');
    await fs.ensureDir(versionsDir);
    
    const versionPath = path.join(versionsDir, `${filename}-v${version}.json`);
    const content = JSON.stringify(flow, null, 2);
    
    await fs.writeFile(versionPath, content, 'utf8');
    
    console.log(chalk.blue(`📦 Version saved: ${versionPath}`));
  }

  async loadFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load flow from ${filePath}: ${error.message}`);
    }
  }

  async compareVersions(file1, file2) {
    const [flow1, flow2] = await Promise.all([
      this.loadFromFile(file1),
      this.loadFromFile(file2)
    ]);

    const differences = this.findDifferences(flow1, flow2);
    return differences;
  }

  findDifferences(flow1, flow2) {
    const differences = [];
    
    const compare = (obj1, obj2, path = '') => {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      const allKeys = new Set([...keys1, ...keys2]);
      
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in obj1)) {
          differences.push({ type: 'added', path: currentPath, value: obj2[key] });
        } else if (!(key in obj2)) {
          differences.push({ type: 'removed', path: currentPath, value: obj1[key] });
        } else if (typeof obj1[key] !== typeof obj2[key]) {
          differences.push({ 
            type: 'changed', 
            path: currentPath, 
            oldValue: obj1[key], 
            newValue: obj2[key] 
          });
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          compare(obj1[key], obj2[key], currentPath);
        } else if (obj1[key] !== obj2[key]) {
          differences.push({ 
            type: 'changed', 
            path: currentPath, 
            oldValue: obj1[key], 
            newValue: obj2[key] 
          });
        }
      }
    };
    
    compare(flow1, flow2);
    return differences;
  }

  generateStats(flow) {
    const stats = {
      totalScreens: flow.screens.length,
      terminalScreens: flow.screens.filter(s => s.terminal).length,
      totalComponents: 0,
      componentTypes: {},
      hasRouting: !!flow.routing_model,
      routingConditions: flow.routing_model ? Object.keys(flow.routing_model).length : 0
    };

    flow.screens.forEach(screen => {
      if (screen.layout && screen.layout.children) {
        stats.totalComponents += screen.layout.children.length;
        screen.layout.children.forEach(component => {
          const type = component.type;
          stats.componentTypes[type] = (stats.componentTypes[type] || 0) + 1;
        });
      }
    });

    return stats;
  }

  printStats(flow) {
    const stats = this.generateStats(flow);
    
    console.log(chalk.cyan('\n📊 Flow Statistics:'));
    console.log(`  Total Screens: ${stats.totalScreens}`);
    console.log(`  Terminal Screens: ${stats.terminalScreens}`);
    console.log(`  Total Components: ${stats.totalComponents}`);
    console.log(`  Has Routing: ${stats.hasRouting ? 'Yes' : 'No'}`);
    
    if (stats.hasRouting) {
      console.log(`  Routing Conditions: ${stats.routingConditions}`);
    }
    
    console.log(chalk.cyan('\n📋 Component Types:'));
    Object.entries(stats.componentTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }
}

module.exports = Compiler;
