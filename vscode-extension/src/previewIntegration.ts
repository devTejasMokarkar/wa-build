import * as vscode from 'vscode';
import * as path from 'path';
import { PreviewGenerator } from '../../src/preview/PreviewGenerator';

/**
 * Integration with WhatsApp Flow Builder preview system
 */
export class FlowPreviewIntegration {
    
    /**
     * Generate preview HTML from flow code
     */
    static async generatePreview(flowCode: string, fileName: string): Promise<{html: string, screenCount: number, componentCount: number}> {
        try {
            // Check if it's a flow file or screen file
            if (fileName.endsWith('.flow.js')) {
                return this.generateFlowPreview(flowCode, fileName);
            } else if (fileName.endsWith('.screen.js')) {
                return this.generateScreenPreview(flowCode, fileName);
            } else {
                throw new Error('Unsupported file type');
            }
        } catch (error) {
            console.error('Preview generation failed:', error);
            return this.getErrorPreview(error.message, fileName);
        }
    }

    /**
     * Generate preview for complete flow files
     */
    private static async generateFlowPreview(flowCode: string, fileName: string): Promise<{html: string, screenCount: number, componentCount: number}> {
        try {
            // Execute the flow code safely
            const flow = this.executeFlowCode(flowCode, fileName);
            
            if (!flow || !flow.build) {
                throw new Error('Invalid flow file');
            }

            // Build the flow
            const builtFlow = flow.build();
            
            // Generate preview using existing PreviewGenerator
            const preview = new PreviewGenerator(builtFlow);
            const html = preview.generateHTML();
            
            // Extract statistics
            const screenCount = builtFlow.screens?.length || 0;
            const componentCount = builtFlow.screens?.reduce((sum, screen) => 
                sum + (screen.layout?.children?.length || 0), 0) || 0;

            return {
                html: this.wrapForVSCode(html),
                screenCount,
                componentCount
            };
        } catch (error) {
            return this.getErrorPreview(error.message, fileName);
        }
    }

    /**
     * Generate preview for individual screen files
     */
    private static async generateScreenPreview(screenCode: string, fileName: string): Promise<{html: string, screenCount: number, componentCount: number}> {
        try {
            // Create a mock flow with just this screen
            const mockFlow = {
                version: "7.3",
                data_api_version: "3.0",
                screens: [
                    {
                        id: path.basename(fileName, '.screen.js'),
                        title: 'Screen Preview',
                        layout: {
                            type: "SingleColumnLayout",
                            children: this.extractComponentsFromCode(screenCode)
                        }
                    }
                ]
            };

            const preview = new PreviewGenerator(mockFlow);
            const html = preview.generateHTML();

            return {
                html: this.wrapForVSCode(html),
                screenCount: 1,
                componentCount: mockFlow.screens[0].layout.children.length
            };
        } catch (error) {
            return this.getErrorPreview(error.message, fileName);
        }
    }

    /**
     * Safely execute flow code to get flow object
     */
    private static executeFlowCode(flowCode: string, fileName: string): any {
        try {
            // Create a safe execution context
            const context = {
                createFlow: null,
                require: null,
                module: null,
                exports: null,
                console: {
                    log: console.log,
                    error: console.error,
                    warn: console.warn
                }
            };

            // Mock the createFlow function
            const mockFlows: any[] = [];
            context.createFlow = (name: string, options?: any) => {
                const flow = {
                    name,
                    options,
                    screens: [],
                    currentScreen: null,
                    
                    screen: function(id: string, options?: any) {
                        this.screens.push({ id, options, components: [] });
                        this.currentScreen = { id, options, components: [] };
                        return this;
                    },
                    
                    text: function(name: string, label: string, options?: any) {
                        if (this.currentScreen) {
                            this.currentScreen.components.push({ type: 'TextInput', name, label, options });
                        }
                        return this;
                    },
                    
                    dropdown: function(name: string, label: string, dataSource: any[], options?: any) {
                        if (this.currentScreen) {
                            this.currentScreen.components.push({ type: 'Dropdown', name, label, dataSource, options });
                        }
                        return this;
                    },
                    
                    checkbox: function(name: string, label: string, dataSource: any[], options?: any) {
                        if (this.currentScreen) {
                            this.currentScreen.components.push({ type: 'CheckboxGroup', name, label, dataSource, options });
                        }
                        return this;
                    },
                    
                    submit: function(label: string, action?: string) {
                        if (this.currentScreen) {
                            this.currentScreen.components.push({ type: 'Footer', label, action });
                        }
                        return this;
                    },
                    
                    build: function() {
                        return {
                            version: "7.3",
                            data_api_version: "3.0",
                            screens: this.screens.map(screen => ({
                                id: screen.id,
                                title: screen.options?.title || screen.id,
                                layout: {
                                    type: "SingleColumnLayout",
                                    children: screen.components.map(comp => this.buildComponent(comp))
                                }
                            }))
                        };
                    },
                    
                    buildComponent: function(comp) {
                        switch (comp.type) {
                            case 'TextInput':
                                return {
                                    type: "TextInput",
                                    name: comp.name,
                                    label: comp.label,
                                    required: comp.options?.required !== false,
                                    "input-type": comp.options?.type || "text",
                                    ...(comp.options?.placeholder && { placeholder: comp.options.placeholder }),
                                    ...(comp.options?.maxLength && { "max-length": comp.options.maxLength })
                                };
                            case 'Dropdown':
                                return {
                                    type: "Dropdown",
                                    name: comp.name,
                                    label: comp.label,
                                    required: comp.options?.required !== false,
                                    "data-source": comp.dataSource
                                };
                            case 'CheckboxGroup':
                                return {
                                    type: "CheckboxGroup",
                                    name: comp.name,
                                    label: comp.label,
                                    required: comp.options?.required !== false,
                                    "data-source": comp.dataSource
                                };
                            case 'Footer':
                                return {
                                    type: "Footer",
                                    label: comp.label,
                                    "on-click-action": {
                                        name: comp.action || "complete"
                                    }
                                };
                            default:
                                return {
                                    type: comp.type,
                                    name: comp.name,
                                    label: comp.label
                                };
                        }
                    }
                };
                mockFlows.push(flow);
                return flow;
            };

            // Execute the code in the safe context
            const func = new Function('createFlow', 'require', 'module', 'exports', 'console', flowCode);
            func(context.createFlow, context.require, context.module, context.exports, context.console);

            // Return the first created flow
            return mockFlows[0];
        } catch (error) {
            console.error('Flow execution error:', error);
            throw new Error(`Failed to execute flow: ${error.message}`);
        }
    }

    /**
     * Extract components from screen code (simplified)
     */
    private static extractComponentsFromCode(screenCode: string): any[] {
        // This is a simplified version - in production, you'd want proper AST parsing
        const components: any[] = [];
        
        // Look for common patterns
        if (screenCode.includes('TextInput') || screenCode.includes('text(')) {
            components.push({
                type: 'TextInput',
                name: 'sample_input',
                label: 'Sample Input',
                required: true
            });
        }
        
        if (screenCode.includes('Dropdown') || screenCode.includes('dropdown(')) {
            components.push({
                type: 'Dropdown',
                name: 'sample_dropdown',
                label: 'Sample Dropdown',
                required: true,
                'data-source': [
                    { id: 'option1', title: 'Option 1' },
                    { id: 'option2', title: 'Option 2' }
                ]
            });
        }
        
        if (screenCode.includes('CheckboxGroup') || screenCode.includes('checkbox(')) {
            components.push({
                type: 'CheckboxGroup',
                name: 'sample_checkbox',
                label: 'Sample Checkbox',
                required: true,
                'data-source': [
                    { id: 'check1', title: 'Check 1' },
                    { id: 'check2', title: 'Check 2' }
                ]
            });
        }
        
        if (screenCode.includes('Footer') || screenCode.includes('submit(')) {
            components.push({
                type: 'Footer',
                label: 'Submit',
                'on-click-action': { name: 'complete' }
            });
        }

        return components;
    }

    /**
     * Wrap preview HTML for VS Code integration
     */
    private static wrapForVSCode(html: string): string {
        // Extract the body content from the generated HTML
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
        if (bodyMatch) {
            return bodyMatch[1];
        }
        return html;
    }

    /**
     * Generate error preview
     */
    private static getErrorPreview(errorMessage: string, fileName: string): {html: string, screenCount: number, componentCount: number} {
        const errorHtml = `
            <div style="padding: 20px; color: #ff6b6b; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <h3>❌ Preview Error</h3>
                <p><strong>File:</strong> ${path.basename(fileName)}</p>
                <p><strong>Error:</strong> ${errorMessage}</p>
                <p>Please check your flow code and try again.</p>
            </div>
        `;

        return {
            html: errorHtml,
            screenCount: 0,
            componentCount: 0
        };
    }

    /**
     * Open preview in external browser
     */
    static async openExternalPreview(flowCode: string, fileName: string): Promise<void> {
        try {
            const preview = await this.generatePreview(flowCode, fileName);
            
            // Create temporary HTML file
            const tempDir = path.join(require('os').tmpdir(), 'wa-flow-preview');
            const fs = require('fs');
            
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const tempFile = path.join(tempDir, `${path.basename(fileName, '.js')}-preview.html`);
            fs.writeFileSync(tempFile, preview.html);
            
            // Open in browser
            const { shell } = require('electron');
            await shell.openExternal(`file://${tempFile}`);
            
            vscode.window.showInformationMessage(`Preview opened in browser: ${tempFile}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open external preview: ${error.message}`);
        }
    }

    /**
     * Export flow as JSON
     */
    static async exportFlow(flowCode: string, fileName: string): Promise<void> {
        try {
            const flow = this.executeFlowCode(flowCode, fileName);
            
            if (!flow || !flow.build) {
                throw new Error('Invalid flow file');
            }

            const builtFlow = flow.build();
            
            // Save dialog
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(path.join(path.dirname(fileName), `${path.basename(fileName, '.js')}.json`)),
                filters: {
                    'JSON Files': ['json']
                }
            });

            if (saveUri) {
                const fs = require('fs');
                fs.writeFileSync(saveUri.fsPath, JSON.stringify(builtFlow, null, 2));
                vscode.window.showInformationMessage(`Flow exported to: ${saveUri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export flow: ${error.message}`);
        }
    }
}
