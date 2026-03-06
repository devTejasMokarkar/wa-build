# WhatsApp Flow Builder - Examples Documentation

## Available Examples

### demo-flow-example.js
```javascript
const { createFlow } = require('../index');

// Create the exact flow from your JSON example
const demoFlow = createFlow('DemoFlow')
  .screen('DEMO_SCREEN', { title: 'Demo Screen' })
  .link('This is an embedded link', {
    name: "navigate",
    next: {
      type: "screen",
      name: "FINISH"
    },
    payload: {
      test_payload: "This is a test_payload"
    }
  })
  .screen('FINISH', { title: 'Final screen', terminal: true })
  .data('test_payload', {
    type: "string",
    "__example...
```

### embedded-link-example.js
```javascript
const { createFlow } = require('../index');

// Example 1: Valid flow with EmbeddedLinks (within limit)
const validFlow = createFlow('ValidLinkFlow')
  .screen('DEMO_SCREEN', { title: 'Demo Screen' })
  .text('name', 'Your Name')
  .linkNavigate('Click me to continue', 'FINISH', { test_payload: 'This is a test_payload' })
  .linkComplete('Submit Now', { action: 'complete' })
  .screen('FINISH', { title: 'Final screen', terminal: true })
  .build();

console.log('✅ Valid flow with EmbeddedLinks c...
```

### maharashtra-services-working.flow.js
```javascript
/**
 * Working example of Maharashtra Services Flow in the exact JSON format you requested
 */

const FlowJSONBuilder = require('../src/core/FlowJSONBuilder');

// Create the exact flow structure you provided
const flow = new FlowJSONBuilder("7.0", "3.0")
  .routing({
    "WELCOME": ["SERVICES", "CHECK_APPLICATION_STATUS"],
    "SERVICES": ["CHECK_APPLICATION_STATUS"],
    "CHECK_APPLICATION_STATUS": []
  })
  .screen("WELCOME", "Welcome", {
    screenDescription: { type: "string", __example__: ...
```

### maharashtra-services.flow.js
```javascript
const { DynamicFlowBuilder } = require('../src/core/DynamicFlowBuilder');

// Example flow matching the exact JSON format you provided
const flow = DynamicFlowBuilder.create('MaharashtraServices')
  .routing({
    "WELCOME": ["SERVICES", "CHECK_APPLICATION_STATUS"],
    "SERVICES": ["CHECK_APPLICATION_STATUS"],
    "CHECK_APPLICATION_STATUS": []
  })
  .screen("WELCOME", "Welcome", {
    screenDescription: { type: "string", __example__: "Welcome To Maharashtra" },
    LSearch: { type: "string", ...
```

### production-ready-example.js
```javascript
/**
 * Production-Ready WhatsApp Flow Example
 * 
 * This example demonstrates a complete, enterprise-grade WhatsApp Flow
 * using the wa-flow-builder framework with all advanced features:
 * - Clean DSL syntax
 * - EmbeddedLink validation (max 3 per screen)
 * - Schema validation
 * - Error handling
 * - Component composition
 */

const { createFlow, EmbeddedLink } = require('../index');

async function createProductionFlow() {
  try {
    console.log('🏗️  Building production-ready WhatsApp Fl...
```

Generated on: 2026-03-06T10:08:59.942Z