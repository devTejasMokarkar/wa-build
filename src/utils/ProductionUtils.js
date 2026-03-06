const fs = require('fs');
const path = require('path');
const { ErrorHandler } = require('../core/ErrorHandler');

class ProductionUtils {
  static validateEnvironment() {
    const requiredEnvVars = ['NODE_ENV'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',
      isTest: process.env.NODE_ENV === 'test'
    };
  }

  static optimizeBundle(content, options = {}) {
    const {
      minify = true,
      removeComments = true,
      removeWhitespace = false
    } = options;

    let optimized = content;

    if (removeComments) {
      optimized = optimized.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    }

    if (removeWhitespace) {
      optimized = optimized.replace(/\s+/g, ' ').trim();
    }

    if (minify) {
      optimized = optimized.replace(/\n\s+/g, '').replace(/\s+/g, ' ');
    }

    return optimized;
  }

  static createProductionBuild(buildPath = './dist') {
    return ErrorHandler.wrap(() => {
      // Clean build directory
      if (fs.existsSync(buildPath)) {
        fs.rmSync(buildPath, { recursive: true, force: true });
      }
      
      fs.mkdirSync(buildPath, { recursive: true });
      
      // Copy essential files
      const filesToCopy = [
        { src: './package.json', dest: path.join(buildPath, 'package.json') },
        { src: './README.md', dest: path.join(buildPath, 'README.md') },
        { src: './LICENSE', dest: path.join(buildPath, 'LICENSE') }
      ];

      filesToCopy.forEach(({ src, dest }) => {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });

      // Create production package.json
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const productionPackageJson = {
        ...packageJson,
        scripts: {
          start: 'node index.js',
          test: 'node test/test.js'
        },
        devDependencies: undefined
      };
      
      // Remove undefined devDependencies
      delete productionPackageJson.devDependencies;
      
      fs.writeFileSync(
        path.join(buildPath, 'package.json'),
        JSON.stringify(productionPackageJson, null, 2)
      );

      console.log(`✅ Production build created at: ${buildPath}`);
      return buildPath;
    }, { action: 'createProductionBuild', buildPath });
  }

  static generateBundleStats(sourcePath = './src') {
    return ErrorHandler.wrap(() => {
      const stats = {
        files: 0,
        totalLines: 0,
        totalSize: 0,
        components: 0,
        utils: 0,
        core: 0
      };

      const analyzeDirectory = (dirPath) => {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            analyzeDirectory(itemPath);
          } else if (item.endsWith('.js')) {
            stats.files++;
            stats.totalSize += stat.size;
            
            const content = fs.readFileSync(itemPath, 'utf8');
            stats.totalLines += content.split('\n').length;
            
            // Categorize files
            if (itemPath.includes('/components/')) stats.components++;
            else if (itemPath.includes('/utils/')) stats.utils++;
            else if (itemPath.includes('/core/')) stats.core++;
          }
        });
      };

      analyzeDirectory(sourcePath);
      
      console.log('📊 Bundle Statistics:');
      console.log(`   Files: ${stats.files}`);
      console.log(`   Total Lines: ${stats.totalLines}`);
      console.log(`   Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
      console.log(`   Components: ${stats.components}`);
      console.log(`   Utils: ${stats.utils}`);
      console.log(`   Core: ${stats.core}`);
      
      return stats;
    }, { action: 'generateBundleStats', sourcePath });
  }

  
  static validateFlowIntegrity(flow) {
    return ErrorHandler.wrap(() => {
      const errors = [];
      const warnings = [];

      // Basic structure validation
      if (!flow.screens || flow.screens.length === 0) {
        errors.push('Flow must have at least one screen');
      }

      if (flow.screens && flow.screens.length > 50) {
        warnings.push('Flow has more than 50 screens, which may impact performance');
      }

      // Screen validation
      flow.screens?.forEach((screen, index) => {
        if (!screen.id) {
          errors.push(`Screen ${index} is missing ID`);
        }

        if (!screen.layout || !screen.layout.children) {
          errors.push(`Screen ${screen.id} has invalid layout`);
        }

        // Component validation
        screen.layout?.children?.forEach((component, compIndex) => {
          if (!component.type) {
            errors.push(`Component ${compIndex} in screen ${screen.id} is missing type`);
          }

          // Check for embedded link limits
          if (component.type === 'EmbeddedLink') {
            const embeddedLinks = screen.layout.children.filter(c => c.type === 'EmbeddedLink');
            if (embeddedLinks.length > 3) {
              errors.push(`Screen ${screen.id} exceeds maximum EmbeddedLink limit (3)`);
            }
          }
        });
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    }, { action: 'validateFlowIntegrity' });
  }

  static createPerformanceReport(flow) {
    return ErrorHandler.wrap(() => {
      const report = {
        timestamp: new Date().toISOString(),
        flow: {
          name: flow.name || 'Unknown',
          screens: flow.screens?.length || 0,
          totalComponents: flow.screens?.reduce((total, screen) => 
            total + (screen.layout?.children?.length || 0), 0
          ) || 0
        },
        performance: {
          estimatedLoadTime: this.estimateLoadTime(flow),
          memoryUsage: this.estimateMemoryUsage(flow),
          complexity: this.calculateComplexity(flow)
        },
        recommendations: []
      };

      // Add recommendations
      if (report.flow.screens > 20) {
        report.recommendations.push('Consider breaking large flows into smaller sub-flows');
      }

      if (report.performance.complexity > 0.7) {
        report.recommendations.push('Flow has high complexity, consider simplifying logic');
      }

      if (report.performance.estimatedLoadTime > 2000) {
        report.recommendations.push('Flow may load slowly, optimize component count');
      }

      return report;
    }, { action: 'createPerformanceReport' });
  }

  static estimateLoadTime(flow) {
    // Simple estimation based on component count
    const componentCount = flow.screens?.reduce((total, screen) => 
      total + (screen.layout?.children?.length || 0), 0
    ) || 0;
    
    // Base time + time per component
    return 100 + (componentCount * 50); // milliseconds
  }

  static estimateMemoryUsage(flow) {
    const componentCount = flow.screens?.reduce((total, screen) => 
      total + (screen.layout?.children?.length || 0), 0
    ) || 0;
    
    // Rough estimation in KB
    return Math.round(50 + (componentCount * 2));
  }

  static calculateComplexity(flow) {
    let complexity = 0;
    
    flow.screens?.forEach(screen => {
      const componentCount = screen.layout?.children?.length || 0;
      const hasRouting = flow.routing_model && Object.keys(flow.routing_model).length > 0;
      
      complexity += componentCount * 0.1;
      complexity += hasRouting ? 0.2 : 0;
      complexity += screen.terminal ? 0.1 : 0;
    });
    
    return Math.min(complexity, 1.0);
  }
}

module.exports = ProductionUtils;
