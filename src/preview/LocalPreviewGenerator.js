const fs = require('fs');
const path = require('path');

class LocalPreviewGenerator {
  constructor() {
    this.outputDir = './preview-output';
    this.templatesDir = './src/preview/templates';
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
    console.log(`${color}[PREVIEW] ${message}${reset}`);
  }

  generatePreview(flowJson, options = {}) {
    const {
      interactive = false,
      flowAction = 'navigate',
      flowActionPayload = null,
      phoneNumber = null,
      debug = false
    } = options;

    this.log('Generating local flow preview', 'info');

    // Create preview HTML
    const previewHtml = this.createPreviewHtml(flowJson, options);
    
    // Save preview file
    const previewFile = path.join(this.outputDir, 'flow-preview.html');
    this.ensureDirectory();
    fs.writeFileSync(previewFile, previewHtml);

    this.log(`Preview generated: ${previewFile}`, 'success');
    this.log(`Open in browser: file://${path.resolve(previewFile)}`, 'info');
    
    return {
      previewUrl: `file://${path.resolve(previewFile)}`,
      previewFile,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  createPreviewHtml(flowJson, options) {
    const { interactive = false, debug = false } = options;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Flow Preview - ${flowJson.version || 'Local'}</title>
    <style>
        /* WhatsApp-inspired styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f0f2f5;
            padding: 20px;
        }
        
        .preview-container {
            max-width: 430px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
            min-height: 600px;
        }
        
        .preview-header {
            background: #00a884;
            color: white;
            padding: 15px 20px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
        }
        
        .preview-content {
            padding: 20px;
        }
        
        .screen {
            display: none;
        }
        
        .screen.active {
            display: block;
        }
        
        .screen-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #111b21;
        }
        
        .text-body {
            margin-bottom: 20px;
            line-height: 1.5;
            color: #3b4a54;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #111b21;
        }
        
        .form-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d9d0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #00a884;
        }
        
        .dropdown {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d9d0;
            border-radius: 8px;
            font-size: 16px;
            background: white;
            cursor: pointer;
        }
        
        .footer-button {
            background: #00a884;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: background-color 0.2s;
        }
        
        .footer-button:hover {
            background: #009675;
        }
        
        .footer-button:disabled {
            background: #d1d9d0;
            cursor: not-allowed;
        }
        
        .screen-selector {
            margin-bottom: 20px;
            padding: 15px;
            background: #f0f8ff;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
        }
        
        .screen-selector .form-label {
            font-weight: 600;
            color: #0066cc;
            margin-bottom: 8px;
        }
        
        .screen-selector .dropdown {
            background: white;
            border-color: #0066cc;
        }
        
        .screen-selector .dropdown:focus {
            border-color: #00a884;
        }
        
        .debug-panel {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
            display: ${debug ? 'block' : 'none'};
        }
        
        .debug-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
        }
        
        .preview-info {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .debug-content {
            background: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .preview-info h3 {
            color: #0066cc;
            margin-bottom: 8px;
        }
    .preview-info p {
            color: #333;
            margin: 4px 0;
        }
    }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            📱 WhatsApp Flow Preview
        </div>
        
        <div class="preview-content">
            <div class="preview-info">
                <h3>Flow Information</h3>
                <p><strong>Version:</strong> ${flowJson.version || 'N/A'}</p>
                <p><strong>Data API Version:</strong> ${flowJson.data_api_version || 'N/A'}</p>
                <p><strong>Screens:</strong> ${flowJson.screens?.length || 0}</p>
                <p><strong>Interactive Mode:</strong> ${interactive ? 'Yes' : 'No'}</p>
                ${debug ? '<p><strong>Debug Mode:</strong> Enabled</p>' : ''}
            </div>
            
            ${flowJson.screens?.length > 1 ? `
            <div class="screen-selector">
                <label class="form-label">Navigate to Screen:</label>
                <select class="dropdown" id="screenSelector" onchange="navigateToScreen(this.value)">
                    <option value="">Select a screen...</option>
                    ${flowJson.screens.map((screen, index) => 
                        `<option value="${index}">${screen.title || 'Screen ' + (index + 1)} (${screen.id})${screen.terminal ? ' 🏁' : ''}</option>`
                    ).join('')}
                </select>
            </div>
            ` : ''}
            
            ${this.generateScreens(flowJson.screens || [], interactive)}
            
            <div class="debug-panel" id="debugPanel">
                <div class="debug-title">Debug Information</div>
                <div class="debug-content" id="debugContent">
                    Waiting for user interaction...
                </div>
            </div>
        </div>
    </div>

    <script>
        // Flow data
        const flowData = ${JSON.stringify(flowJson, null, 2)};
        let currentScreen = 0;
        let formData = {};
        
        ${interactive ? this.generateInteractiveScript() : this.generateStaticScript()}
        
        function updateDebug(action, data) {
            if (${debug}) {
                const debugContent = document.getElementById('debugContent');
                const timestamp = new Date().toISOString();
                debugContent.textContent = \`[\${timestamp}] \${action}\\n\${JSON.stringify(data, null, 2)}\`;
                debugContent.scrollTop = debugContent.scrollHeight;
            }
        }
        
        function showScreen(screenIndex, screenData = {}) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show target screen
            const targetScreen = document.getElementById(\`screen-\${screenIndex}\`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                currentScreen = screenIndex;
                
                // Update debug
                updateDebug('Screen Changed', {
                    screenIndex,
                    screenId: flowData.screens[screenIndex]?.id,
                    screenData
                });
            }
        }
        
        function navigateToScreen(screenIndex) {
            if (screenIndex === "") return;
            
            const index = parseInt(screenIndex);
            showScreen(index);
            
            updateDebug('Screen Navigation', {
                action: 'manual_navigation',
                targetScreen: index,
                screenId: flowData.screens[index]?.id
            });
        }
        
        function handleNavigation(targetScreenId) {
            const targetIndex = flowData.screens.findIndex(screen => screen.id === targetScreenId);
            if (targetIndex !== -1) {
                showScreen(targetIndex);
            }
        }
        
        function handleComplete() {
            updateDebug('Flow Completed', {
                finalData: formData,
                screensCompleted: flowData.screens.map(s => s.id)
            });
            alert('Flow completed! Data: ' + JSON.stringify(formData, null, 2));
        }
        
        // Initialize first screen
        document.addEventListener('DOMContentLoaded', function() {
            showScreen(0);
            
            // Update screen selector when screen changes
            const screenSelector = document.getElementById('screenSelector');
            if (screenSelector) {
                screenSelector.value = currentScreen;
            }
            
            updateDebug('Flow Started', {
                flowData: {
                    version: flowData.version,
                    screens: flowData.screens.map(s => s.id),
                    interactive: ${interactive}
                }
            });
        });
    </script>
</body>
</html>`;
  }

  generateScreens(screens, interactive) {
    return screens.map((screen, index) => `
        <div class="screen ${index === 0 ? 'active' : ''}" id="screen-${index}">
            <h2 class="screen-title">${screen.title || 'Screen ' + (index + 1)}</h2>
            
            ${screen.layout?.children?.map(component => this.generateComponent(component, interactive)).join('') || ''}
            
            ${screen.terminal ? '<div style="margin-top: 20px; padding: 10px; background: #e8f5e8; border-radius: 8px; color: #2d5a2d;">🏁 Terminal Screen - Flow ends here</div>' : ''}
        </div>
    `).join('');
  }

  generateComponent(component, interactive) {
    switch (component.type) {
      case 'TextBody':
        return `<div class="text-body">${component.text || ''}</div>`;
        
      case 'TextInput':
        return interactive ? `
            <div class="form-group">
                <label class="form-label">${component.label || 'Input'}</label>
                <input type="${component['input-type'] || 'text'}" 
                       class="form-input" 
                       name="${component.name}"
                       placeholder="${component.label || 'Enter value...'}"
                       ${component.required ? 'required' : ''}>
            </div>
        ` : `
            <div class="form-group">
                <label class="form-label">${component.label || 'Input'}</label>
                <div class="form-input" style="background: #f8f9fa; color: #666;">
                    ${component.required ? '(Required) ' : ''}${component.label || 'Text Input'}
                </div>
            </div>
        `;
        
      case 'Dropdown':
        return interactive ? `
            <div class="form-group">
                <label class="form-label">${component.label || 'Select'}</label>
                <select class="dropdown" name="${component.name}" ${component.required ? 'required' : ''}>
                    <option value="">Select an option...</option>
                    ${(component['data-source'] || []).map(option => 
                        `<option value="${option.id}">${option.title}</option>`
                    ).join('')}
                </select>
            </div>
        ` : `
            <div class="form-group">
                <label class="form-label">${component.label || 'Select'}</label>
                <div class="form-input" style="background: #f8f9fa; color: #666;">
                    ${component.required ? '(Required) ' : ''}${component.label || 'Dropdown'} 
                    (${(component['data-source'] || []).length} options)
                </div>
            </div>
        `;
        
      case 'Footer':
        return interactive ? `
            <button class="footer-button" onclick="handleFooterAction('${component['on-click-action']?.name}', '${component['on-click-action']?.next?.name || ''}')">
                ${component.label || 'Continue'}
            </button>
        ` : `
            <button class="footer-button" disabled>
                ${component.label || 'Continue'}
            </button>
        `;
        
      default:
        return `<div style="padding: 10px; background: #fff3cd; border-radius: 8px; margin: 10px 0;">
            📦 Component: ${component.type}
        </div>`;
    }
  }

  generateInteractiveScript() {
    return `
        function handleFooterAction(actionName, targetScreen) {
            // Collect form data
            const currentScreenElement = document.getElementById('screen-' + currentScreen);
            const inputs = currentScreenElement.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                formData[input.name] = input.value;
            });
            
            updateDebug('Footer Action', {
                action: actionName,
                targetScreen,
                formData
            });
            
            if (actionName === 'navigate' && targetScreen) {
                handleNavigation(targetScreen);
            } else if (actionName === 'complete') {
                handleComplete();
            }
        }
        
        // Add change listeners for form inputs
        document.addEventListener('change', function(e) {
            if (e.target.matches('input, select')) {
                formData[e.target.name] = e.target.value;
                updateDebug('Form Input Changed', {
                    field: e.target.name,
                    value: e.target.value
                });
            }
        });
    `;
  }

  generateStaticScript() {
    return `
        function handleFooterAction(actionName, targetScreen) {
            updateDebug('Static Mode Action', {
                action: actionName,
                targetScreen,
                note: 'Interactive mode is disabled'
            });
            
            if (actionName === 'navigate') {
                alert('Navigate to: ' + targetScreen + ' (Interactive mode disabled)');
            } else if (actionName === 'complete') {
                alert('Flow completed! (Interactive mode disabled)');
            }
        }
    `;
  }

  ensureDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      this.log(`Created directory: ${this.outputDir}`, 'info');
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    console.log(colors[type](`🎨 ${message}`));
  }
}

module.exports = LocalPreviewGenerator;
