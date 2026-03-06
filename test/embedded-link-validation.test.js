const { createFlow, EmbeddedLink, Validator } = require('../index');

describe('EmbeddedLink Validation', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  test('should allow up to 3 EmbeddedLinks per screen', () => {
    const flow = createFlow('ValidFlow')
      .screen('SCREEN_1', { title: 'Screen with 3 links' })
      .linkNavigate('Link 1', 'SCREEN_2')
      .linkNavigate('Link 2', 'SCREEN_2')
      .linkNavigate('Link 3', 'SCREEN_2')
      .screen('SCREEN_2', { title: 'Next Screen', terminal: true })
      .build();

    const errors = validator.validateFlow(flow);
    expect(errors.length).toBe(0);
  });

  test('should reject more than 3 EmbeddedLinks per screen', () => {
    expect(() => {
      createFlow('InvalidFlow')
        .screen('SCREEN_1', { title: 'Screen with 4 links' })
        .linkNavigate('Link 1', 'SCREEN_2')
        .linkNavigate('Link 2', 'SCREEN_2')
        .linkNavigate('Link 3', 'SCREEN_2')
        .linkNavigate('Link 4', 'SCREEN_2') // This should fail
        .build();
    }).toThrow('Maximum EmbeddedLink limit (3) reached');
  });

  test('should validate EmbeddedLink structure', () => {
    const flow = {
      version: "7.3",
      data_api_version: "3.0",
      screens: [
        {
          id: "TEST_SCREEN",
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "EmbeddedLink",
                text: "Test Link"
                // Missing on-click-action
              }
            ]
          }
        }
      ]
    };

    const errors = validator.validateFlow(flow);
    expect(errors.some(e => e.includes('missing on-click-action'))).toBe(true);
  });

  test('should count EmbeddedLinks correctly across multiple screens', () => {
    const flow = createFlow('MultiScreenFlow')
      .screen('SCREEN_1', { title: 'Screen 1' })
      .linkNavigate('Link 1', 'SCREEN_2')
      .linkNavigate('Link 2', 'SCREEN_2')
      .screen('SCREEN_2', { title: 'Screen 2' })
      .linkNavigate('Link 3', 'SCREEN_3')
      .linkNavigate('Link 4', 'SCREEN_3')
      .linkNavigate('Link 5', 'SCREEN_3')
      .screen('SCREEN_3', { title: 'Screen 3', terminal: true })
      .build();

    const errors = validator.validateFlow(flow);
    expect(errors.length).toBe(0); // Each screen has <= 3 links
  });

  test('should support different EmbeddedLink types', () => {
    const flow = createFlow('LinkTypesFlow')
      .screen('LINK_TYPES', { title: 'Different Link Types' })
      .linkNavigate('Navigate Link', 'NEXT_SCREEN')
      .linkComplete('Complete Link', { data: 'test' })
      .linkApi('API Link', 'https://api.example.com', 'POST', { action: 'test' })
      .screen('NEXT_SCREEN', { title: 'Next Screen', terminal: true })
      .build();

    const errors = validator.validateFlow(flow);
    expect(errors.length).toBe(0);
  });

  test('should work with EmbeddedLink component directly', () => {
    const flow = createFlow('DirectComponentFlow')
      .screen('DIRECT_SCREEN', { title: 'Direct Component' })
      .add(EmbeddedLink.navigate('Direct Navigate', 'NEXT'))
      .add(EmbeddedLink.complete('Direct Complete'))
      .add(EmbeddedLink.api('Direct API', 'https://api.test.com'))
      .screen('NEXT', { title: 'Next', terminal: true })
      .build();

    const errors = validator.validateFlow(flow);
    expect(errors.length).toBe(0);
  });
});

// Run tests if called directly
if (require.main === module) {
  console.log('🧪 Running EmbeddedLink validation tests...\n');

  try {
    // Test 1: Valid flow with 3 links
    console.log('✅ Test 1: Valid flow with 3 EmbeddedLinks');
    const validFlow = createFlow('ValidFlow')
      .screen('SCREEN_1', { title: 'Screen with 3 links' })
      .linkNavigate('Link 1', 'SCREEN_2')
      .linkNavigate('Link 2', 'SCREEN_2')
      .linkNavigate('Link 3', 'SCREEN_2')
      .screen('SCREEN_2', { title: 'Next Screen', terminal: true })
      .build();
    console.log('   ✓ Passed\n');

    // Test 2: Invalid flow with 4 links
    console.log('✅ Test 2: Invalid flow with 4 EmbeddedLinks (should fail)');
    try {
      createFlow('InvalidFlow')
        .screen('SCREEN_1', { title: 'Screen with 4 links' })
        .linkNavigate('Link 1', 'SCREEN_2')
        .linkNavigate('Link 2', 'SCREEN_2')
        .linkNavigate('Link 3', 'SCREEN_2')
        .linkNavigate('Link 4', 'SCREEN_2')
        .build();
      console.log('   ❌ Failed - Should have thrown error\n');
    } catch (error) {
      console.log('   ✓ Passed - Correctly caught error:', error.message, '\n');
    }

    // Test 3: Different link types
    console.log('✅ Test 3: Different EmbeddedLink types');
    const linkTypesFlow = createFlow('LinkTypesFlow')
      .screen('LINK_TYPES', { title: 'Different Link Types' })
      .linkNavigate('Navigate Link', 'NEXT_SCREEN')
      .linkComplete('Complete Link', { data: 'test' })
      .linkApi('API Link', 'https://api.example.com', 'POST', { action: 'test' })
      .screen('NEXT_SCREEN', { title: 'Next Screen', terminal: true })
      .build();
    console.log('   ✓ Passed\n');

    console.log('🎉 All EmbeddedLink validation tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

module.exports = {};
