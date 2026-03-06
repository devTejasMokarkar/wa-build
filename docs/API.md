# WhatsApp Flow Builder - API Documentation

## Version 2.0.0

### Core Classes

#### Flow
```javascript
const { Flow } = require('./index');
const flow = new Flow('MyFlow');
```

#### FlowBuilder
```javascript
const { createFlow } = require('./index');
const flow = createFlow('MyFlow');
```

### Components

#### TextInput
```javascript
.textInput('name', 'Your Name', { required: true })
```

#### Dropdown
```javascript
.dropdown('category', 'Select Category', [
  { id: 'cat1', title: 'Category 1' },
  { id: 'cat2', title: 'Category 2' }
])
```

#### CheckboxGroup
```javascript
.checkboxGroup('interests', 'Interests', [
  { id: 'sports', title: 'Sports' },
  { id: 'music', title: 'Music' }
])
```

#### EmbeddedLink
```javascript
.embeddedLink('Learn More', 'https://example.com', { style: 'primary' })
```

#### Footer
```javascript
.footer('Continue', { next: 'NEXT_SCREEN' })
```

### Validation

```javascript
const { validateFlow } = require('./index');
const validation = validateFlow(flow);
// Returns: { valid: boolean, errors: string[], warnings: string[] }
```

### Utilities

```javascript
const { generateStats } = require('./index');
const stats = generateStats('./src');
```

Generated on: 2026-03-06T10:08:59.941Z
