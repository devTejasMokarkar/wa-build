const { createFlow } = require('../index');

// Example 1: Valid flow with EmbeddedLinks (within limit)
const validFlow = createFlow('ValidLinkFlow')
  .screen('DEMO_SCREEN', { title: 'Demo Screen' })
  .text('name', 'Your Name')
  .linkNavigate('Click me to continue', 'FINISH', { test_payload: 'This is a test_payload' })
  .linkComplete('Submit Now', { action: 'complete' })
  .screen('FINISH', { title: 'Final screen', terminal: true })
  .build();

console.log('✅ Valid flow with EmbeddedLinks created successfully');

// Example 2: Invalid flow (too many EmbeddedLinks)
try {
  const invalidFlow = createFlow('InvalidLinkFlow')
    .screen('TOO_MANY_LINKS', { title: 'Too Many Links Screen' })
    .linkNavigate('Link 1', 'NEXT')
    .linkNavigate('Link 2', 'NEXT')
    .linkNavigate('Link 3', 'NEXT')
    .linkNavigate('Link 4', 'NEXT') // This should fail
    .build();
} catch (error) {
  console.log('❌ Expected error:', error.message);
}

// Example 3: Using EmbeddedLink component directly
const { EmbeddedLink } = require('../index');

const directLinkFlow = createFlow('DirectLinkFlow')
  .screen('DIRECT_SCREEN', { title: 'Direct Link Screen' })
  .add(EmbeddedLink.navigate('Navigate to Finish', 'FINISH'))
  .add(EmbeddedLink.complete('Complete Flow', { data: 'test' }))
  .screen('FINISH', { title: 'Finish', terminal: true })
  .build();

console.log('✅ Direct EmbeddedLink usage successful');

// Example 4: API link
const apiLinkFlow = createFlow('ApiLinkFlow')
  .screen('API_SCREEN', { title: 'API Link Screen' })
  .text('name', 'Your Name')
  .linkApi('Call API', 'https://api.example.com/submit', 'POST', { name: '{{name}}' })
  .submit('Submit')
  .build();

console.log('✅ API link flow created successfully');

module.exports = {
  validFlow,
  directLinkFlow,
  apiLinkFlow
};
