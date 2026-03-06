import * as vscode from 'vscode';
import * as path from 'path';
import { WebSocketServer } from 'ws';
import { FlowPreviewIntegration } from './previewIntegration';

export function activate(context: vscode.ExtensionContext) {
    console.log('WhatsApp Flow Builder Preview extension is now active!');

    // Create preview provider
    const previewProvider = new FlowPreviewProvider(context);
    
    // Register commands
    const previewCommand = vscode.commands.registerCommand('wa-flow.preview', () => {
        previewProvider.showPreview();
    });
    
    const previewSideCommand = vscode.commands.registerCommand('wa-flow.previewSide', () => {
        previewProvider.showSidePreview();
    });

    // Register webview provider for side panel
    const sidebarProvider = new FlowSidebarProvider(context.extensionUri);
    
    context.subscriptions.push(
        previewCommand,
        previewSideCommand,
        vscode.window.registerWebviewViewProvider('waFlowPreview', sidebarProvider)
    );

    // Handle messages from webview
    const handleWebviewMessage = async (message: any) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const fileName = editor.document.fileName;
        const flowCode = editor.document.getText();

        switch (message.command) {
            case 'openPreview':
                previewProvider.showPreview();
                break;
            case 'refreshPreview':
                previewProvider.refresh();
                break;
            case 'openExternal':
                await FlowPreviewIntegration.openExternalPreview(flowCode, fileName);
                break;
            case 'exportFlow':
                await FlowPreviewIntegration.exportFlow(flowCode, fileName);
                break;
            case 'requestPreview':
                await previewProvider.refresh();
                break;
        }
    };

    // Register message handler
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (document.fileName.endsWith('.flow.js') || document.fileName.endsWith('.screen.js')) {
                await previewProvider.refresh();
            }
        })
    );

    // Auto-refresh on file changes
    const autoRefresh = vscode.workspace.getConfiguration('waFlow').get('autoRefresh', true);
    if (autoRefresh) {
        const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{flow,screen}.js');
        fileWatcher.onDidChange(() => previewProvider.refresh());
        fileWatcher.onDidCreate(() => previewProvider.refresh());
        fileWatcher.onDidDelete(() => previewProvider.refresh());
        context.subscriptions.push(fileWatcher);
    }
}

class FlowPreviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private wsServer: WebSocketServer | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async showPreview() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const fileName = editor.document.fileName;
        if (!this.isFlowFile(fileName)) {
            vscode.window.showWarningMessage('This is not a flow or screen file');
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'waFlowPreview',
            'WhatsApp Flow Preview',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
            }
        );

        this.panel.webview.html = await this.getPreviewHtml();
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            if (this.wsServer) {
                this.wsServer.close();
                this.wsServer = undefined;
            }
        });

        // Start WebSocket server for live updates
        this.startWebSocketServer();
        
        // Initial preview
        this.refresh();
    }

    async showSidePreview() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const fileName = editor.document.fileName;
        if (!this.isFlowFile(fileName)) {
            vscode.window.showWarningMessage('This is not a flow or screen file');
            return;
        }

        // Trigger sidebar refresh
        vscode.commands.executeCommand('workbench.view.explorer');
        vscode.commands.executeCommand('waFlowPreview.focus');
    }

    private isFlowFile(fileName: string): boolean {
        return fileName.endsWith('.flow.js') || fileName.endsWith('.screen.js');
    }

    private async getPreviewHtml(): Promise<string> {
        const nonce = getNonce();
        const config = vscode.workspace.getConfiguration('waFlow');
        const theme = config.get('theme', 'whatsapp');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${this.panel?.webview.cspSource}; script-src 'nonce-${nonce}' 'unsafe-inline' ${this.panel?.webview.cspSource};">
                <title>WhatsApp Flow Preview</title>
                <style nonce="${nonce}">
                    ${this.getPreviewCSS(theme)}
                </style>
            </head>
            <body nonce="${nonce}">
                <div class="preview-container">
                    <div class="header">
                        <div class="title">WhatsApp Flow Preview</div>
                        <div class="controls">
                            <button id="resetBtn" class="control-btn" title="Reset Preview">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                </svg>
                            </button>
                            <button id="refreshBtn" class="control-btn" title="Refresh Preview">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="content">
                        <div class="phone-frame" id="phoneFrame">
                            <div class="loading">Loading preview...</div>
                        </div>
                        
                        <div class="info-panel" id="infoPanel">
                            <h3>Flow Information</h3>
                            <div class="stats" id="stats">
                                <div class="stat">
                                    <span class="stat-label">File:</span>
                                    <span class="stat-value" id="fileName">-</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Screens:</span>
                                    <span class="stat-value" id="screenCount">-</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Components:</span>
                                    <span class="stat-value" id="componentCount">-</span>
                                </div>
                            </div>
                            
                            <div class="actions">
                                <button id="openExternalBtn" class="action-btn">
                                    🌐 Open in Browser
                                </button>
                                <button id="exportBtn" class="action-btn">
                                    📤 Export Flow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <script nonce="${nonce}">
                    ${this.getPreviewScript()}
                </script>
            </body>
            </html>
        `;
    }

    private getPreviewCSS(theme: string): string {
        const themes = {
            whatsapp: `
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
                .preview-container { max-width: 1200px; margin: 0 auto; }
                .header { background: #075E54; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 16px; font-weight: 600; }
                .controls { display: flex; gap: 10px; }
                .control-btn { background: rgba(255,255,255,0.1); border: none; color: white; padding: 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .control-btn:hover { background: rgba(255,255,255,0.2); }
                .content { display: flex; gap: 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .phone-frame { width: 375px; height: 667px; background: #000; border-radius: 20px; padding: 10px; position: relative; overflow: hidden; }
                .phone-frame iframe { width: 100%; height: 100%; border: none; border-radius: 15px; }
                .info-panel { flex: 1; padding: 20px; }
                .info-panel h3 { color: #075E54; margin: 0 0 15px 0; font-size: 18px; }
                .stats { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
                .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .stat-label { color: #666; }
                .stat-value { font-weight: 600; color: #075E54; }
                .actions { display: flex; flex-direction: column; gap: 10px; }
                .action-btn { background: #128C7E; color: white; border: none; padding: 12px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
                .action-btn:hover { background: #0A5E52; }
                .loading { display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 14px; }
            `,
            light: `
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
                .header { background: #6c757d; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
                .phone-frame { width: 375px; height: 667px; background: #fff; border: 1px solid #dee2e6; border-radius: 8px; }
            `,
            dark: `
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; margin: 0; padding: 20px; }
                .header { background: #343a40; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
                .phone-frame { width: 375px; height: 667px; background: #2d3748; border: 1px solid #4a5568; border-radius: 8px; }
            `
        };
        return themes[theme] || themes.whatsapp;
    }

    private getPreviewScript(): string {
        return `
            const vscode = acquireVsCodeApi();
            
            // Initialize
            document.addEventListener('DOMContentLoaded', function() {
                setupEventListeners();
                requestPreview();
            });

            function setupEventListeners() {
                // Reset button
                document.getElementById('resetBtn').addEventListener('click', function() {
                    resetPreview();
                });

                // Refresh button
                document.getElementById('refreshBtn').addEventListener('click', function() {
                    requestPreview();
                });

                // Open external button
                document.getElementById('openExternalBtn').addEventListener('click', function() {
                    vscode.postMessage({
                        command: 'openExternal'
                    });
                });

                // Export button
                document.getElementById('exportBtn').addEventListener('click', function() {
                    vscode.postMessage({
                        command: 'exportFlow'
                    });
                });
            }

            function requestPreview() {
                vscode.postMessage({
                    command: 'requestPreview'
                });
            }

            function resetPreview() {
                document.getElementById('phoneFrame').innerHTML = '<div class="loading">Loading preview...</div>';
                updateStats('-', '-', '-');
                requestPreview();
            }

            function updatePreview(html) {
                document.getElementById('phoneFrame').innerHTML = html;
            }

            function updateStats(fileName, screenCount, componentCount) {
                document.getElementById('fileName').textContent = fileName || '-';
                document.getElementById('screenCount').textContent = screenCount || '-';
                document.getElementById('componentCount').textContent = componentCount || '-';
            }

            // Listen for messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'updatePreview':
                        updatePreview(message.html);
                        updateStats(message.fileName, message.screenCount, message.componentCount);
                        break;
                    case 'updateStats':
                        updateStats(message.fileName, message.screenCount, message.componentCount);
                        break;
                    case 'openExternal':
                        vscode.postMessage({
                            command: 'openExternal'
                        });
                        break;
                    case 'exportFlow':
                        vscode.postMessage({
                            command: 'exportFlow'
                        });
                        break;
                }
            });
        `;
    }

    private startWebSocketServer() {
        const config = vscode.workspace.getConfiguration('waFlow');
        const port = config.get('previewPort', 3001);

        try {
            this.wsServer = new WebSocketServer({ port });
            
            this.wsServer.on('connection', (ws) => {
                console.log('Preview client connected');
                
                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        if (data.type === 'refresh') {
                            this.refresh();
                        }
                    } catch (error) {
                        console.error('WebSocket message error:', error);
                    }
                });
            });

            console.log(`WebSocket server started on port ${port}`);
        } catch (error) {
            console.error('Failed to start WebSocket server:', error);
        }
    }

    async refresh() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.isFlowFile(editor.document.fileName)) {
            return;
        }

        try {
            const flowCode = editor.document.getText();
            const previewHtml = await this.generatePreview(flowCode, editor.document.fileName);
            
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'updatePreview',
                    html: previewHtml.html,
                    fileName: path.basename(editor.document.fileName),
                    screenCount: previewHtml.screenCount,
                    componentCount: previewHtml.componentCount
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Preview generation failed: ${error.message}`);
        }
    }

    private async generatePreview(flowCode: string, fileName: string): Promise<{html: string, screenCount: number, componentCount: number}> {
        return await FlowPreviewIntegration.generatePreview(flowCode, fileName);
    }
}

class FlowSidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private _extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const nonce = getNonce();
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}' 'unsafe-inline' ${webview.cspSource};">
                <title>WhatsApp Flow Preview</title>
                <style nonce="${nonce}">
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 10px; }
                    .container { text-align: center; padding: 20px; }
                    .preview-frame { width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 8px; }
                    .controls { margin-top: 10px; }
                    button { background: #075E54; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px; }
                    button:hover { background: #054e44; }
                </style>
            </head>
            <body nonce="${nonce}">
                <div class="container">
                    <h3>Flow Preview</h3>
                    <div class="preview-frame" id="previewFrame">
                        <p>Select a flow or screen file to preview</p>
                    </div>
                    <div class="controls">
                        <button onclick="openPreview()">Open Preview</button>
                        <button onclick="refreshPreview()">Refresh</button>
                    </div>
                </div>
                
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    
                    function openPreview() {
                        vscode.postMessage({
                            command: 'openPreview'
                        });
                    }
                    
                    function refreshPreview() {
                        vscode.postMessage({
                            command: 'refreshPreview'
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {
    console.log('WhatsApp Flow Builder Preview extension deactivated');
}
