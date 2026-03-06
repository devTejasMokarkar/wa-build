const DynamicFlowBuilder = require('./src/core/DynamicFlowBuilder');

console.log('🔍 Testing DynamicFlowBuilder...');

try {
  const flow = DynamicFlowBuilder.create('test', {
    version: '7.0',
    dataApiVersion: '3.0'
  });

  console.log('✅ DynamicFlowBuilder created');
  console.log('📊 Mode:', flow.mode);
  console.log('📊 Builder type:', typeof flow.builder);

  // Add a simple screen
  flow.screen('TEST', 'Test Screen', {
    userName: '{{user.name}}'
  });

  console.log('✅ Screen added');
  console.log('📊 Current screen:', flow.builder.currentScreen?.id);

  // Add a text component
  flow.text('Hello {{user.name}}!', 'TextBody');
  console.log('✅ Text component added');

  // Check the flow structure
  const builtFlow = flow.builder.flow;
  console.log('📊 Flow screens:', builtFlow.screens?.length || 0);
  console.log('📊 Flow structure:', JSON.stringify(builtFlow, null, 2));

  // Try to build
  console.log('🔨 Building flow...');
  const result = flow.build();
  console.log('✅ Flow built successfully');
  console.log('📊 Result:', typeof result);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('📊 Stack:', error.stack);
}
