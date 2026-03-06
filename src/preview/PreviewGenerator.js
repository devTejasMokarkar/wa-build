const fs = require('fs');
const path = require('path');

class PreviewGenerator {
  constructor(flow) {
    this.flow = flow;
    this.currentScreen = 0;
    this.flowData = {};
  }

  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Flow Preview - ${this.flow.screens[0]?.title || 'Flow'}</title>
    <style>
        ${this.getCSS()}
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="phone-frame">
            <div class="phone-header">
                <div class="status-bar">
                    <span class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <div class="status-icons">
                        <span>📶</span>
                        <span>📶</span>
                        <span>🔋</span>
                    </div>
                </div>
                <div class="app-header">
                    <span class="back-button">←</span>
                    <span class="app-title">WhatsApp Flow</span>
                    <span class="menu-button">⋮</span>
                </div>
            </div>
            
            <div class="chat-container">
                ${this.renderCurrentScreen()}
            </div>
            
            <div class="navigation">
                <button onclick="preview.previousScreen()" ${this.currentScreen === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <span class="screen-counter">
                    Screen ${this.currentScreen + 1} of ${this.flow.screens.length}
                </span>
                <button onclick="preview.nextScreen()" ${this.isLastScreen() ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        </div>
        
        <div class="info-panel">
            <h3>Flow Information</h3>
            <div class="flow-stats">
                <div class="stat">
                    <span class="stat-label">Total Screens:</span>
                    <span class="stat-value">${this.flow.screens.length}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Current Screen:</span>
                    <span class="stat-value">${this.flow.screens[this.currentScreen]?.id || 'N/A'}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Components:</span>
                    <span class="stat-value">${this.getCurrentScreenComponents().length}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Terminal:</span>
                    <span class="stat-value">${this.flow.screens[this.currentScreen]?.terminal ? 'Yes' : 'No'}</span>
                </div>
            </div>
            
            <h4>Screen Data</h4>
            <div class="flow-data">
                <pre>${JSON.stringify(this.flowData, null, 2)}</pre>
            </div>
        </div>
    </div>
    
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;
  }

  renderCurrentScreen() {
    const screen = this.flow.screens[this.currentScreen];
    if (!screen) return '<div class="error">No screen found</div>';

    return `
        <div class="screen" id="${screen.id}">
            <div class="screen-title">${screen.title}</div>
            <div class="screen-content">
                ${screen.layout.children.map(component => 
                    this.renderComponent(component)
                ).join('')}
            </div>
        </div>
    `;
  }

  renderComponent(component) {
    switch (component.type) {
      case 'TextBody':
        return `
            <div class="chat-bubble received">
                ${component.markdown ? this.renderMarkdown(component.text) : component.text}
            </div>
        `;
      
      case 'TextInput':
        return `
            <div class="form-group">
                <div class="chat-bubble received">
                    <strong>${component.label}${component.required ? ' *' : ''}</strong>
                </div>
                <div class="input-group">
                    <input type="${component['input-type']}" 
                           class="text-input" 
                           placeholder="${component.placeholder || ''}"
                           data-name="${component.name}"
                           onchange="preview.updateData('${component.name}', this.value)">
                </div>
            </div>
        `;
      
      case 'Dropdown':
        return `
            <div class="form-group">
                <div class="chat-bubble received">
                    <strong>${component.label}${component.required ? ' *' : ''}</strong>
                </div>
                <div class="input-group">
                    <select class="dropdown" 
                            data-name="${component.name}"
                            onchange="preview.updateData('${component.name}', this.value)">
                        <option value="">Select an option...</option>
                        ${component['data-source'].map(option => 
                            `<option value="${option.id}">${option.title}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
      
      case 'CheckboxGroup':
        return `
            <div class="form-group">
                <div class="chat-bubble received">
                    <strong>${component.label}${component.required ? ' *' : ''}</strong>
                </div>
                <div class="checkbox-group">
                    ${component['data-source'].map(option => 
                        `<div class="checkbox-item">
                            <input type="checkbox" 
                                   id="${option.id}" 
                                   value="${option.id}"
                                   data-name="${component.name}"
                                   onchange="preview.updateCheckbox('${component.name}', '${option.id}', this.checked)">
                            <label for="${option.id}">${option.title}</label>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
      
      case 'EmbeddedLink':
        return `
            <div class="embedded-link-container">
                <button class="embedded-link" onclick="preview.handleEmbeddedLink('${component.text}')">
                    🔗 ${component.text}
                </button>
            </div>
        `;
      
      case 'Footer':
        return `
            <div class="footer-container">
                <button class="footer-button" onclick="preview.handleFooter('${component.label}', '${component['on-click-action']?.name || 'unknown'}')">
                    ${component.label}
                </button>
            </div>
        `;
      
      default:
        return `
            <div class="unknown-component">
                <div class="chat-bubble received">
                    <em>Unknown component: ${component.type}</em>
                </div>
            </div>
        `;
    }
  }

  renderMarkdown(text) {
    // Simple markdown rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  getCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .preview-container {
            display: flex;
            gap: 30px;
            max-width: 1200px;
            width: 100%;
        }

        .phone-frame {
            width: 375px;
            height: 812px;
            background: #000;
            border-radius: 40px;
            padding: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        }

        .phone-header {
            background: #075E54;
            color: white;
            border-radius: 30px 30px 0 0;
            overflow: hidden;
        }

        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 20px;
            font-size: 12px;
        }

        .status-icons {
            display: flex;
            gap: 5px;
        }

        .app-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            font-weight: 600;
        }

        .chat-container {
            flex: 1;
            background: #E5DDD5;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .screen {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .screen-title {
            text-align: center;
            font-weight: 600;
            color: #075E54;
            padding: 10px;
            background: rgba(255,255,255,0.8);
            border-radius: 10px;
        }

        .chat-bubble {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
        }

        .chat-bubble.received {
            background: #DCF8C6;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .chat-bubble.sent {
            background: #128C7E;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-group {
            align-self: flex-start;
        }

        .text-input, .dropdown {
            padding: 12px 16px;
            border: 1px solid #CCC;
            border-radius: 18px;
            font-size: 16px;
            width: 250px;
            background: white;
        }

        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-self: flex-start;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            padding: 8px 12px;
            border-radius: 18px;
        }

        .checkbox-item input[type="checkbox"] {
            margin: 0;
        }

        .embedded-link-container {
            align-self: flex-start;
        }

        .embedded-link {
            background: #E3F2FD;
            color: #1976D2;
            border: 1px solid #1976D2;
            padding: 10px 16px;
            border-radius: 18px;
            cursor: pointer;
            font-weight: 500;
        }

        .footer-container {
            align-self: flex-start;
            margin-top: 10px;
        }

        .footer-button {
            background: #128C7E;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 18px;
            font-weight: bold;
            cursor: pointer;
            min-width: 120px;
        }

        .footer-button:hover {
            background: #0A5E52;
        }

        .navigation {
            background: #F0F2F5;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0 0 30px 30px;
        }

        .navigation button {
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            background: #128C7E;
            color: white;
            cursor: pointer;
            font-weight: 500;
        }

        .navigation button:disabled {
            background: #CCC;
            cursor: not-allowed;
        }

        .screen-counter {
            font-size: 14px;
            color: #666;
            font-weight: 500;
        }

        .info-panel {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            min-width: 300px;
        }

        .info-panel h3 {
            color: #075E54;
            margin-bottom: 15px;
            border-bottom: 2px solid #075E54;
            padding-bottom: 8px;
        }

        .info-panel h4 {
            color: #075E54;
            margin: 20px 0 10px 0;
        }

        .flow-stats {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .stat {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #EEE;
        }

        .stat-label {
            color: #666;
        }

        .stat-value {
            font-weight: 600;
            color: #075E54;
        }

        .flow-data {
            background: #F8F9FA;
            padding: 15px;
            border-radius: 8px;
            max-height: 200px;
            overflow-y: auto;
        }

        .flow-data pre {
            font-size: 12px;
            color: #333;
            white-space: pre-wrap;
        }

        .unknown-component {
            opacity: 0.7;
        }

        @media (max-width: 768px) {
            .preview-container {
                flex-direction: column;
                align-items: center;
            }
            
            .phone-frame {
                width: 100%;
                max-width: 375px;
                height: auto;
                min-height: 600px;
            }
            
            .info-panel {
                width: 100%;
                max-width: 375px;
            }
        }
    `;
  }

  getJavaScript() {
    return `
        const preview = {
            flow: ${JSON.stringify(this.flow)},
            currentScreen: ${this.currentScreen},
            flowData: ${JSON.stringify(this.flowData)},
            
            updateData: function(name, value) {
                this.flowData[name] = value;
                this.updateFlowDataDisplay();
            },
            
            updateCheckbox: function(groupName, value, checked) {
                if (!this.flowData[groupName]) {
                    this.flowData[groupName] = [];
                }
                
                if (checked) {
                    if (!this.flowData[groupName].includes(value)) {
                        this.flowData[groupName].push(value);
                    }
                } else {
                    this.flowData[groupName] = this.flowData[groupName].filter(item => item !== value);
                }
                
                this.updateFlowDataDisplay();
            },
            
            updateFlowDataDisplay: function() {
                const dataElement = document.querySelector('.flow-data pre');
                if (dataElement) {
                    dataElement.textContent = JSON.stringify(this.flowData, null, 2);
                }
            },
            
            nextScreen: function() {
                if (this.currentScreen < this.flow.screens.length - 1) {
                    this.currentScreen++;
                    this.updateScreen();
                }
            },
            
            previousScreen: function() {
                if (this.currentScreen > 0) {
                    this.currentScreen--;
                    this.updateScreen();
                }
            },
            
            updateScreen: function() {
                const chatContainer = document.querySelector('.chat-container');
                const screenCounter = document.querySelector('.screen-counter');
                const prevButton = document.querySelector('.navigation button:first-child');
                const nextButton = document.querySelector('.navigation button:last-child');
                
                // Update screen content
                chatContainer.innerHTML = this.renderCurrentScreen();
                
                // Update counter
                screenCounter.textContent = \`Screen \${this.currentScreen + 1} of \${this.flow.screens.length}\`;
                
                // Update buttons
                prevButton.disabled = this.currentScreen === 0;
                nextButton.disabled = this.currentScreen === this.flow.screens.length - 1;
                
                // Update info panel
                this.updateInfoPanel();
            },
            
            renderCurrentScreen: function() {
                const screen = this.flow.screens[this.currentScreen];
                if (!screen) return '<div class="error">No screen found</div>';

                return \`
                    <div class="screen" id="\${screen.id}">
                        <div class="screen-title">\${screen.title}</div>
                        <div class="screen-content">
                            \${screen.layout.children.map(component => 
                                this.renderComponent(component)
                            ).join('')}
                        </div>
                    </div>
                \`;
            },
            
            renderComponent: function(component) {
                switch (component.type) {
                    case 'TextBody':
                        return \`
                            <div class="chat-bubble received">
                                \${component.markdown ? this.renderMarkdown(component.text) : component.text}
                            </div>
                        \`;
                    
                    case 'TextInput':
                        return \`
                            <div class="form-group">
                                <div class="chat-bubble received">
                                    <strong>\${component.label}\${component.required ? ' *' : ''}</strong>
                                </div>
                                <div class="input-group">
                                    <input type="\${component['input-type']}" 
                                           class="text-input" 
                                           placeholder="\${component.placeholder || ''}"
                                           data-name="\${component.name}"
                                           value="\${this.flowData[component.name] || ''}"
                                           onchange="preview.updateData('\${component.name}', this.value)">
                                </div>
                            </div>
                        \`;
                    
                    case 'Dropdown':
                        return \`
                            <div class="form-group">
                                <div class="chat-bubble received">
                                    <strong>\${component.label}\${component.required ? ' *' : ''}</strong>
                                </div>
                                <div class="input-group">
                                    <select class="dropdown" 
                                            data-name="\${component.name}"
                                            onchange="preview.updateData('\${component.name}', this.value)">
                                        <option value="">Select an option...</option>
                                        \${component['data-source'].map(option => 
                                            \`<option value="\${option.id}" \${this.flowData[component.name] === option.id ? 'selected' : ''}>\${option.title}</option>\`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                        \`;
                    
                    case 'CheckboxGroup':
                        return \`
                            <div class="form-group">
                                <div class="chat-bubble received">
                                    <strong>\${component.label}\${component.required ? ' *' : ''}</strong>
                                </div>
                                <div class="checkbox-group">
                                    \${component['data-source'].map(option => 
                                        \`<div class="checkbox-item">
                                            <input type="checkbox" 
                                                   id="\${option.id}" 
                                                   value="\${option.id}"
                                                   data-name="\${component.name}"
                                                   \${(this.flowData[component.name] || []).includes(option.id) ? 'checked' : ''}
                                                   onchange="preview.updateCheckbox('\${component.name}', '\${option.id}', this.checked)">
                                            <label for="\${option.id}">\${option.title}</label>
                                        </div>\`
                                    ).join('')}
                                </div>
                            </div>
                        \`;
                    
                    case 'EmbeddedLink':
                        return \`
                            <div class="embedded-link-container">
                                <button class="embedded-link" onclick="preview.handleEmbeddedLink('\${component.text}')">
                                    🔗 \${component.text}
                                </button>
                            </div>
                        \`;
                    
                    case 'Footer':
                        return \`
                            <div class="footer-container">
                                <button class="footer-button" onclick="preview.handleFooter('\${component.label}', '\${component['on-click-action']?.name || 'unknown'}')">
                                    \${component.label}
                                </button>
                            </div>
                        \`;
                    
                    default:
                        return \`
                            <div class="unknown-component">
                                <div class="chat-bubble received">
                                    <em>Unknown component: \${component.type}</em>
                                </div>
                            </div>
                        \`;
                }
            },
            
            renderMarkdown: function(text) {
                return text
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                    .replace(/\`(.*?)\`/g, '<code>$1</code>');
            },
            
            handleEmbeddedLink: function(text) {
                alert('Embedded Link clicked: ' + text);
                console.log('Embedded Link clicked:', text, this.flowData);
            },
            
            handleFooter: function(label, action) {
                console.log('Footer clicked:', label, action, this.flowData);
                
                if (action === 'complete') {
                    alert('Flow completed! Data: ' + JSON.stringify(this.flowData, null, 2));
                } else if (action === 'navigate') {
                    this.nextScreen();
                } else {
                    alert('Action: ' + action + '\\nData: ' + JSON.stringify(this.flowData, null, 2));
                }
            },
            
            updateInfoPanel: function() {
                const screen = this.flow.screens[this.currentScreen];
                const stats = document.querySelectorAll('.stat-value');
                
                if (stats[0]) stats[0].textContent = this.flow.screens.length;
                if (stats[1]) stats[1].textContent = screen?.id || 'N/A';
                if (stats[2]) stats[2].textContent = screen?.layout?.children?.length || 0;
                if (stats[3]) stats[3].textContent = screen?.terminal ? 'Yes' : 'No';
            }
        };
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            preview.updateFlowDataDisplay();
            preview.updateInfoPanel();
        });
    `;
  }

  getCurrentScreenComponents() {
    const screen = this.flow.screens[this.currentScreen];
    return screen?.layout?.children || [];
  }

  isLastScreen() {
    return this.currentScreen >= this.flow.screens.length - 1;
  }

  serve(port = 3000) {
    const express = require('express');
    const app = express();
    
    app.get('/', (req, res) => {
      res.send(this.generateHTML());
    });
    
    app.listen(port, () => {
      console.log(`🚀 Preview server running on http://localhost:${port}`);
    });
  }

  saveToFile(filePath = 'preview.html') {
    const html = this.generateHTML();
    fs.writeFileSync(filePath, html);
    console.log(`✅ Preview saved to: ${filePath}`);
    return filePath;
  }
}

module.exports = PreviewGenerator;
