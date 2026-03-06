# WhatsApp Flow Builder - Component Documentation

## Supported Components

### 1. TextInput
- **Purpose**: Text input field
- **Properties**: name, label, required, input-type
- **Validation**: Required fields, type validation

### 2. Dropdown
- **Purpose**: Selection from options
- **Properties**: name, label, data-source (array)
- **Validation**: Required fields, data-source validation

### 3. CheckboxGroup
- **Purpose**: Multi-select checkboxes
- **Properties**: name, label, data-source (array)
- **Validation**: Required fields, data-source validation

### 4. EmbeddedLink
- **Purpose**: Clickable links
- **Limit**: Maximum 3 per screen
- **Properties**: text, on-click-action, style, color

### 5. Footer
- **Purpose**: Action buttons
- **Properties**: label, on-click-action

### 6. TextBody
- **Purpose**: Rich text content
- **Properties**: text, style

## Validation Rules

- All components must have a 'type' field
- EmbeddedLink maximum: 3 per screen
- Screen IDs must be unique
- Routing must reference existing screens

Generated on: 2026-03-06T10:08:59.941Z
