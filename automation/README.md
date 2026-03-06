# WhatsApp Flow Builder - Complete Automation System

## 🚀 Overview

This automation system provides comprehensive CI/CD capabilities for WhatsApp Flow Builder, including building, testing, validation, deployment, and monitoring workflows.

## 📦 Installation

```bash
cd automation
npm install
```

## 🛠️ Available Scripts

### Basic Automation
```bash
# Run complete automation workflow
npm run automate

# Development mode (build, test, validate)
npm run automate:dev

# Full automation with deployment
npm run automate:full

# Watch mode - auto-rebuild on changes
npm run automate:watch
```

### CI/CD Pipeline
```bash
# Run complete CI/CD pipeline
npm run ci

# GitHub Actions specific
npm run ci:github

# GitLab CI specific
npm run ci:gitlab
```

### Quality & Deployment
```bash
# Quality checks only
npm run quality

# Deployment only
npm run deploy

# Generate reports
npm run report
```

## 🔧 Configuration

### CI Configuration (`.ci-config.json`)

```json
{
  "nodeVersion": "18.x",
  "cacheDependencies": true,
  "runSecurityAudit": true,
  "generateArtifacts": true,
  "notifyOnFailure": true,
  "parallelJobs": 4,
  "timeoutMinutes": 30,
  "environment": {
    "NODE_ENV": "test"
  },
  "qualityGates": {
    "performance": {
      "maxLoadTime": 2000,
      "maxComplexity": 0.8
    },
    "coverage": {
      "minCoverage": 80
    },
    "bundleSize": {
      "maxSize": 1048576
    }
  }
}
```

## 📊 Automation Features

### 1. Environment Setup
- ✅ Environment validation
- ✅ Directory creation
- ✅ Git configuration
- ✅ Dependency caching

### 2. Code Quality Checks
- ✅ ESLint validation
- ✅ Security audit
- ✅ Dependency verification
- ✅ Code formatting checks

### 3. Build Process
- ✅ Development build
- ✅ Production build
- ✅ Bundle optimization
- ✅ Statistics generation

### 4. Testing
- ✅ Unit tests
- ✅ Integration tests
- ✅ Coverage reporting
- ✅ Test result analysis

### 5. Validation
- ✅ Flow integrity validation
- ✅ JSON schema validation
- ✅ Business rule validation
- ✅ Performance validation

### 6. Bundle Analysis
- ✅ Size analysis
- ✅ Performance metrics
- ✅ Complexity analysis
- ✅ Recommendations

### 7. Documentation Generation
- ✅ API documentation
- ✅ Component documentation
- ✅ Examples documentation
- ✅ Auto-generated guides

### 8. Deployment
- ✅ Version bumping
- ✅ Git operations
- ✅ NPM publishing
- ✅ Release notes

## 🎯 Quality Gates

### Performance Gate
- Maximum load time: 2000ms
- Maximum complexity: 80%
- Memory usage monitoring

### Coverage Gate
- Minimum test coverage: 80%
- Critical path coverage
- Branch coverage analysis

### Bundle Size Gate
- Maximum bundle size: 1MB
- Component count limits
- Asset optimization

## 📈 CI/CD Integration

### GitHub Actions
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18.x'
      - run: cd automation && npm ci
      - run: cd automation && npm run ci:github
```

### GitLab CI
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - cd automation
    - npm ci
    - npm run ci:gitlab
```

### Jenkins
```groovy
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'cd automation && npm ci && npm run ci'
      }
    }
  }
}
```

## 📊 Reports & Artifacts

### Generated Reports
- `reports/bundle-analysis.json` - Bundle size and performance
- `reports/security-analysis.json` - Security vulnerability report
- `reports/performance-analysis.json` - Performance metrics
- `reports/coverage.lcov` - Test coverage data

### Artifacts
- `artifacts/dist/` - Built distribution files
- `artifacts/flows/` - Generated flow JSON files
- `artifacts/version-info.json` - Build metadata
- `artifacts/manifest.json` - Artifact manifest

## 🔍 Monitoring & Logging

### Log Files
- `logs/automation-*.json` - Detailed automation logs
- `logs/failure-notification.json` - Failure notifications

### Real-time Monitoring
- Build progress tracking
- Performance metrics
- Error notifications
- Success confirmations

## 🚨 Error Handling

### Automatic Recovery
- Retry mechanisms for transient failures
- Graceful degradation for non-critical failures
- Detailed error reporting with stack traces

### Notification System
- Slack integration (configurable)
- Email notifications (configurable)
- GitHub status checks
- Custom webhook support

## 🎛️ Advanced Usage

### Custom Automation Workflows
```javascript
const AutomationEngine = require('./automate');

const automation = new AutomationEngine({
  autoBuild: true,
  autoTest: true,
  autoValidate: true,
  autoDeploy: false,
  watchMode: false
});

// Run custom workflow
automation.runFullAutomation()
  .then(report => console.log('Success:', report))
  .catch(error => console.error('Failed:', error));
```

### Custom Quality Gates
```javascript
// Override quality gate thresholds
const automation = new AutomationEngine({
  qualityGates: {
    performance: { maxLoadTime: 1500 },
    coverage: { minCoverage: 90 },
    bundleSize: { maxSize: 512000 }
  }
});
```

### Watch Mode with Custom Handlers
```javascript
const automation = new AutomationEngine({ watchMode: true });

const watcher = await automation.watchMode();
watcher.on('change', async (filePath) => {
  console.log(`File changed: ${filePath}`);
  // Custom logic here
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   chmod +x automation/automate.js
   chmod +x automation/ci-pipeline.js
   ```

2. **Missing Dependencies**
   ```bash
   cd automation
   npm ci
   ```

3. **Cache Issues**
   ```bash
   rm -rf node_modules/.cache
   npm install
   ```

### Debug Mode
```bash
DEBUG=true npm run automate
```

### Verbose Logging
```bash
VERBOSE=true npm run ci
```

## 📚 API Reference

### AutomationEngine Class
```javascript
const automation = new AutomationEngine(options);

// Methods
await automation.runFullAutomation()
await automation.setupEnvironment()
await automation.runQualityChecks()
await automation.runBuildProcess()
await automation.runTests()
await automation.runValidation()
await automation.analyzeBundles()
await automation.generateDocumentation()
await automation.runDeployment()
await automation.watchMode()
```

### CIPipeline Class
```javascript
const pipeline = new CIPipeline();

// Methods
await pipeline.executeCIPipeline()
await pipeline.setupCIEnvironment()
await pipeline.runParallelJobs()
await pipeline.generateArtifacts()
await pipeline.runQualityGates()
```

## 🎯 Best Practices

1. **Always run quality gates before deployment**
2. **Use watch mode during development**
3. **Configure notifications for team awareness**
4. **Monitor bundle sizes and performance**
5. **Keep dependencies updated**
6. **Review security audit reports regularly**
7. **Maintain high test coverage**
8. **Document custom configurations**

## 🚀 Production Deployment

### Environment Setup
```bash
export NODE_ENV=production
export CI=true
cd automation
npm ci
npm run automate:full
```

### Monitoring
- Set up monitoring dashboards
- Configure alerting for failures
- Track performance metrics
- Monitor bundle sizes over time

## 📞 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review the configuration in `.ci-config.json`
3. Verify all dependencies are installed
4. Check system requirements (Node.js >= 14.0.0)

---

**This automation system transforms your WhatsApp Flow Builder development into a streamlined, professional CI/CD workflow!** 🚀
