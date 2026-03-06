# WhatsApp Flow Builder Preview - VS Code Extension

## 🎨 Live Preview for WhatsApp Flow Builder inside VS Code

Transform your WhatsApp Flow development experience with real-time preview directly in your editor!

---

## ✨ Features

### **🔴 Live Preview**
- **Real-time Updates**: Preview updates as you type
- **WhatsApp UI**: Authentic mobile interface
- **Interactive Components**: Test forms, dropdowns, checkboxes
- **Screen Navigation**: Browse through flow screens
- **Error Detection**: Instant error feedback

### **🛠️ Developer Tools**
- **VS Code Integration**: Native editor experience
- **File Detection**: Works with `.flow.js` and `.screen.js` files
- **Auto-refresh**: Updates on file changes
- **External Preview**: Open in browser
- **Flow Export**: Export as JSON

### **🎯 Smart Features**
- **Component Recognition**: Identifies all flow components
- **Validation**: Built-in error checking
- **Statistics**: Screen and component counts
- **Theme Support**: WhatsApp, light, dark themes

---

## 🚀 Installation

### **From VS Code Marketplace**
1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
3. Search for "WhatsApp Flow Builder Preview"
4. Click **Install**

### **From VSIX (Development)**
```bash
# Clone the repository
git clone https://github.com/your-repo/wa-flow-builder.git
cd wa-flow-builder/vscode-extension

# Install dependencies
npm install

# Build the extension
npm run compile

# Package as VSIX
vsce package

# Install in VS Code
code --install-extension wa-flow-builder-preview-1.0.0.vsix
```

---

## 📖 Usage

### **Quick Start**
1. **Open a flow file** (`.flow.js` or `.screen.js`)
2. **Click the preview button** in the editor title bar
3. **See live preview** in a new panel
4. **Edit your code** - preview updates automatically!

### **Commands**
| Command | Shortcut | Description |
|---------|----------|-------------|
| `WhatsApp Flow: Preview` | - | Open flow preview in new tab |
| `WhatsApp Flow: Preview in Side Panel` | - | Open preview in sidebar |

### **Context Menu**
Right-click on `.flow.js` or `.screen.js` files:
- **Preview WhatsApp Flow** - Open preview
- **Preview in Side Panel** - Sidebar preview

### **Toolbar Integration**
When editing flow files, you'll see:
- **👁️ Preview button** in the editor title bar
- **Auto-refresh** on file changes

---

## 🎨 Preview Features

### **Interactive Components**
✅ **TextInput** - Type and test validation  
✅ **Dropdown** - Select from options  
✅ **CheckboxGroup** - Multi-select functionality  
✅ **EmbeddedLink** - Clickable links  
✅ **Footer** - Action buttons  
✅ **TextBody** - Rich text support  

### **Real-time Data**
```javascript
// As you type in the editor:
.text('name', 'Your Name')           // ← Preview updates instantly
.dropdown('country', 'Country', [     // ← Options appear
  { id: 'us', title: 'USA' },
  { id: 'uk', title: 'UK' }
])
.submit('Continue')                   // ← Button appears
```

### **Flow Statistics**
- **Screen Count**: Number of screens in flow
- **Component Count**: Total components
- **File Name**: Current file being previewed
- **Error Detection**: Syntax and validation errors

---

## ⚙️ Configuration

### **Settings**
```json
{
  "waFlow.autoRefresh": true,          // Auto-refresh on changes
  "waFlow.previewPort": 3000,         // Preview server port
  "waFlow.theme": "whatsapp"          // Preview theme
}
```

### **Themes**
- **whatsapp** - Authentic WhatsApp design (default)
- **light** - Clean light theme
- **dark** - Dark mode theme

---

## 🛠️ Development

### **Project Structure**
```
vscode-extension/
├── src/
│   ├── extension.ts          # Main extension logic
│   └── previewIntegration.ts # Flow preview integration
├── package.json            # Extension manifest
├── tsconfig.json          # TypeScript config
└── README.md             # This file
```

### **Building**
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package as VSIX
vsce package
```

### **Testing**
```bash
# Open development folder in VS Code
code .

# Press F5 to launch Extension Development Host
# Test the extension with sample flow files
```

---

## 📝 Supported File Types

### **Flow Files** (`.flow.js`)
```javascript
const flow = createFlow('MyFlow')
  .screen('WELCOME')
  .text('name', 'Your Name')
  .submit('Continue')
  .build();
```

### **Screen Files** (`.screen.js`)
```javascript
const screen = new Screen('WELCOME')
  .add(new TextInput('name', 'Your Name'))
  .add(new Footer('Continue'));
```

---

## 🎯 Integration with WhatsApp Flow Builder

The extension integrates seamlessly with the main framework:

### **Preview Generation**
- Uses existing `PreviewGenerator` class
- Maintains WhatsApp UI consistency
- Supports all 6 component types

### **Validation**
- Leverages framework's validation system
- Shows errors in real-time
- Provides helpful error messages

### **Export Functionality**
- Exports valid WhatsApp Flow JSON
- Compatible with Meta Flow format
- Ready for WhatsApp Business API

---

## 🔧 Troubleshooting

### **Common Issues**

**Preview not updating**
- Check if auto-refresh is enabled
- Save the file to trigger refresh
- Restart VS Code if needed

**Error in preview**
- Check syntax in your flow file
- Ensure all required imports are present
- Look at error message in preview panel

**Extension not activating**
- Verify file has `.flow.js` or `.screen.js` extension
- Check VS Code developer tools for errors
- Reload VS Code window

### **Debug Mode**
Enable debug logging in VS Code:
1. Open `Help > Toggle Developer Tools`
2. Check Console tab for extension logs
3. Look for error messages

---

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/your-repo/wa-flow-builder.git
cd wa-flow-builder/vscode-extension

# Install dependencies
npm install

# Start development
npm run watch
```

### **Submitting Changes**
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if needed
5. Submit pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/wa-flow-builder/issues)
- **Documentation**: [Main Framework Docs](../README.md)
- **Examples**: [Framework Examples](../examples/)

---

## 🎉 What's Next?

### **Planned Features**
- [ ] Component editing in preview
- [ ] Flow debugging tools
- [ ] Template library
- [ ] Performance profiling
- [ ] Multi-language support

### **Integration Goals**
- [ ] Live collaboration
- [ ] Cloud preview sharing
- [ ] CI/CD integration
- [ ] Plugin system

---

**Transform your WhatsApp Flow development with live preview! 🚀**
