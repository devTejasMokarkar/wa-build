# WhatsApp Flow Builder Framework v2.0

An enterprise-grade framework for building WhatsApp Flows with clean code, auto-generation, and advanced features.

## 🚀 Features

- **Clean Code Architecture**: Write flows in readable, maintainable JavaScript
- **Auto-Generated Meta Flow JSON**: Automatically generates valid WhatsApp Flow JSON
- **Enterprise-Grade**: Supports large flows (50+ screens) with validation
- **Advanced Routing**: Conditional logic and dynamic routing
- **Schema Validation**: Built-in AJV validation for error-free flows
- **DSL Syntax**: Clean, fluent API for rapid development
- **Version Control**: Flow versioning and diff comparison
- **Dev Server**: Live reload and development tools

## 📦 Installation

```bash
npm install
```

## 🏗️ Architecture

```
wa-flow-builder/
│
├── src/
│   ├── core/                # Engine
│   │   ├── Flow.js         # Main flow class
│   │   ├── Screen.js       # Screen builder
│   │   ├── Router.js       # Advanced routing
│   │   ├── Validator.js    # Schema validation
│   │   ├── Compiler.js     # Build system
│   │   └── FlowBuilder.js  # DSL syntax
│   │
│   ├── components/         # UI Components
│   │   ├── TextInput.js
│   │   ├── Dropdown.js
│   │   ├── CheckboxGroup.js
│   │   ├── Footer.js
│   │   └── TextBody.js
│   │
│   ├── actions/            # Actions
│   │   ├── SubmitAction.js
│   │   ├── NavigateAction.js
│   │   └── ApiCallAction.js
│   │
│   └── utils/              # Utilities
│
├── screens/                # Screen definitions
├── flows/                  # Flow definitions
├── compiler/               # Build tools
├── output/                 # Generated JSON
└── index.js               # Main entry
```

## 🎯 Quick Start

### Using DSL Syntax (Recommended)

```javascript
const { createFlow } = require('./index');

const flow = createFlow('MyFlow')
  .screen('WELCOME', { title: 'Welcome' })
  .text('name', 'Your Name', { required: true })
  .email('email', 'Email Address')
  .dropdown('service', 'Select Service', [
    { id: 'electricity', title: 'Electricity' },
    { id: 'water', title: 'Water' }
  ])
  .submit('Continue')
  .build();
```

### Using Screen Classes

```javascript
const { Flow, Screen, TextInput, CheckboxGroup, Footer } = require('./index');

const screen = new Screen('PURPOSE');
screen
  .add(new TextInput('name', 'Your Name'))
  .add(new CheckboxGroup('services', 'Services', [
    { id: '1', title: 'Electricity' },
    { id: '2', title: 'Water' }
  ]))
  .add(new Footer('Submit'))
  .setTerminal();

const flow = new Flow('PensionFlow');
flow.screen(screen);
```

## 🛠️ Available Commands

```bash
# Build flow
npm run build

# Validate flow
npm run validate

# Start development server
npm run dev

# Run tests
npm test
```

## 🎨 UI Preview System

**NEW:** Interactive WhatsApp-style preview for your flows!

### **Preview Features**
- **WhatsApp-like UI** - Authentic mobile interface
- **Interactive Components** - Test forms, dropdowns, checkboxes
- **Screen Navigation** - Browse through flow screens
- **Real-time Data** - See form data as you type
- **Flow Statistics** - Live component and screen info
- **Mobile Responsive** - Works on all devices

### **Quick Start**
```javascript
const flow = createFlow('MyFlow')
  .screen('WELCOME')
  .text('name', 'Your Name')
  .submit('Continue');

// Generate preview HTML
const html = flow.preview({ save: 'my-preview.html' });

// Start live preview server
flow.preview({ serve: true, port: 3000 });
```

### **Preview Options**
```javascript
// Save to file
flow.preview({ save: 'preview.html' });

// Generate HTML string
const html = flow.preview();

// Start development server
flow.preview({ serve: true, port: 3000 });

// Advanced options
flow.preview({ 
  save: 'advanced-preview.html',
  theme: 'whatsapp',
  device: 'mobile'
});
```

### **Preview Components Supported**
✅ TextInput (with validation)  
✅ Dropdown (with options)  
✅ CheckboxGroup (multi-select)  
✅ EmbeddedLink (clickable)  
✅ Footer (actions)  
✅ TextBody (markdown support)

## 📋 Components

### TextInput
```javascript
.text('name', 'Full Name', {
  required: true,
  placeholder: 'Enter name',
  maxLength: 100,
  helperText: 'Please enter your full name'
})
```

### Dropdown
```javascript
.dropdown('category', 'Select Category', [
  { id: 'electricity', title: 'Electricity Bill' },
  { id: 'water', title: 'Water Bill' }
])
```

### CheckboxGroup
```javascript
.checkbox('services', 'Select Services', [
  { id: 'electricity', title: 'Electricity' },
  { id: 'water', title: 'Water' }
], {
  required: true,
  minSelections: 1,
  maxSelections: 3
})
```

### EmbeddedLink (Max 3 per screen)
```javascript
.linkNavigate('Click here', 'NEXT_SCREEN', { data: 'test' })
.linkComplete('Submit Now', { action: 'complete' })
.linkApi('Call API', 'https://api.example.com', 'POST', { payload: 'data' })

// Or using the component directly
.add(EmbeddedLink.navigate('Navigate', 'TARGET_SCREEN'))
.add(EmbeddedLink.complete('Complete', { data: 'value' }))
.add(EmbeddedLink.api('API Call', 'https://api.example.com'))
```

### Footer
```javascript
.submit('Submit Application')     // Complete action
.next('Continue', 'NEXT_SCREEN')  // Navigate action
.back('Go Back', 'PREV_SCREEN')   // Back action
```

## 🧭 Advanced Routing

```javascript
const flow = createFlow('MyFlow');

// Conditional routing
flow.when('has_services', 'WITH_SERVICES', 'NO_SERVICES');

// Advanced router
const router = new Router();
router
  .addRoute('WELCOME', 'SERVICES')
  .addRoute('SERVICES', 'UPLOAD', 'has_services')
  .addCondition('has_services', Router.isNotEmpty('services'))
  .setDefault('WELCOME');
```

## ✅ Validation

Built-in validation ensures error-free flows:

```javascript
const flow = createFlow('MyFlow')
  .screen('WELCOME')
  .text('name', 'Name')
  .validate()  // Throws if invalid
  .build();
```

### Validation Features

- **Schema Validation**: AJV-based JSON schema validation
- **Component Validation**: Each component validated against requirements
- **EmbeddedLink Limits**: Automatically enforces max 3 EmbeddedLinks per screen
- **Screen ID Validation**: Prevents duplicate screen IDs
- **Routing Validation**: Ensures all referenced screens exist

### Example Validation Errors

```javascript
// These will be caught automatically:
❌ Screen PURPOSE referenced but not defined
❌ Screen WELCOME: Too many EmbeddedLinks (4). Maximum allowed is 3
❌ TextInput missing required field: label
❌ Dropdown missing data-source
```

## 📊 Statistics

Get detailed flow statistics:

```javascript
const compiler = new Compiler();
const stats = compiler.generateStats(flow);
console.log(stats);
// Output: { totalScreens: 3, totalComponents: 8, ... }
```

## 🔧 Advanced Features

### Flow Versioning
```javascript
const compiler = new Compiler({ versioning: true });
await compiler.saveToFile(flow, 'my-flow', '2.1.0');
```

### API Integration
```javascript
const { ApiCallAction } = require('./actions');

const apiAction = ApiCallAction.post('https://api.example.com/submit', {
  name: '{{name}}',
  email: '{{email}}'
});
```

### Custom Validation
```javascript
const validator = new Validator();
const errors = validator.validateFlow(flow);
if (errors.length > 0) {
  console.log('Validation errors:', errors);
}
```

## 📝 Examples

### Complete Flow Example

```javascript
const { createFlow } = require('./index');

const pensionFlow = createFlow('PensionFlow', {
  version: '2.0.0',
  dataApiVersion: '3.0'
})
  .screen('WELCOME', { title: 'Welcome to Pension Portal' })
  .text('full_name', 'Full Name', { required: true })
  .email('email', 'Email Address', { required: true })
  .next('Continue', 'PURPOSE')
  
  .screen('PURPOSE', { title: 'Select Services' })
  .checkbox('services', 'What services do you need?', [
    { id: 'electricity', title: 'Electricity Bill' },
    { id: 'water', title: 'Water Bill' },
    { id: 'gas', title: 'Gas Bill' }
  ], { required: true, minSelections: 1 })
  .dropdown('urgency', 'Priority Level', [
    { id: 'low', title: 'Low' },
    { id: 'medium', title: 'Medium' },
    { id: 'high', title: 'High' }
  ])
  .next('Continue', 'UPLOAD')
  
  .screen('UPLOAD', { title: 'Upload Documents', terminal: true })
  .text('reference', 'Reference Number', { required: true })
  .submit('Submit Application')
  
  .when('services_selected', 'SUCCESS', 'ERROR')
  .build();
```

## 🎯 Generated JSON Output

```json
{
  "version": "7.3",
  "data_api_version": "3.0",
  "screens": [
    {
      "id": "WELCOME",
      "title": "Welcome to Pension Portal",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextInput",
            "name": "full_name",
            "label": "Full Name",
            "required": true
          },
          {
            "type": "Footer",
            "label": "Continue",
            "on-click-action": {
              "name": "navigate",
              "next": "PURPOSE"
            }
          }
        ]
      }
    }
  ],
  "routing_model": {
    "services_selected": {
      "true": "SUCCESS",
      "false": "ERROR"
    }
  }
}
```

## 🚀 Enterprise Features

- **Flow Compiler**: Advanced compilation with optimization
- **Flow DSL**: Clean, readable syntax
- **Dynamic API Binding**: Real-time data integration
- **Flow Debugger**: Step-by-step flow testing
- **Visual Flow Builder**: Drag-and-drop interface (planned)

## 📚 API Reference

### Core Classes

- **Flow**: Main flow builder class
- **Screen**: Screen definition and layout
- **Router**: Advanced routing logic
- **Validator**: Schema validation
- **Compiler**: Build and export system
- **FlowBuilder**: DSL syntax builder

### Components

- **TextInput**: Text input field
- **Dropdown**: Dropdown selection
- **CheckboxGroup**: Multiple checkbox selection
- **Footer**: Action buttons
- **TextBody**: Text display

### Actions

- **SubmitAction**: Form submission
- **NavigateAction**: Screen navigation
- **ApiCallAction**: API integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Meta Flow Documentation

For more information about WhatsApp Flows, see the [official Meta documentation](https://developers.facebook.com/docs/whatsapp/flows).

---

Built with ❤️ for the WhatsApp developer community
