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
    "__example__": "CTA title"
  })
  .footer('${data.test_payload}', 'complete')
  .build();

console.log('✅ Demo flow created successfully');
console.log('Generated JSON:', JSON.stringify(demoFlow, null, 2));

// Test validation
const { Validator } = require('../index');
const validator = new Validator();
const errors = validator.validateFlow(demoFlow);

if (errors.length === 0) {
  console.log('✅ Flow validation passed');
} else {
  console.log('❌ Validation errors:', errors);
}

// Test with too many EmbeddedLinks
try {
  const tooManyLinksFlow = createFlow('TooManyLinksFlow')
    .screen('SCREEN_WITH_MANY_LINKS', { title: 'Too Many Links' })
    .link('Link 1', { name: 'navigate', next: { type: 'screen', name: 'NEXT' } })
    .link('Link 2', { name: 'navigate', next: { type: 'screen', name: 'NEXT' } })
    .link('Link 3', { name: 'navigate', next: { type: 'screen', name: 'NEXT' } })
    .link('Link 4', { name: 'navigate', next: { type: 'screen', name: 'NEXT' } }) // This should fail
    .build();
} catch (error) {
  console.log('✅ Correctly caught EmbeddedLink limit error:', error.message);
}

module.exports = { demoFlow };
