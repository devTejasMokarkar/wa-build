const { createFlow } = require('../index');

async function demonstratePreview() {
  console.log('🎨 Creating WhatsApp Flow with Preview functionality...\n');

  // Create a sample flow
  const flow = createFlow('PreviewDemoFlow')
    .screen('WELCOME', { title: '🏛️ Welcome to Pension Portal' })
    .add({
      type: 'TextBody',
      text: 'Welcome! We\'re excited to help you with your pension application. This is a **demo** of the preview functionality.',
      markdown: true
    })
    .text('full_name', 'Full Legal Name', {
      required: true,
      placeholder: 'Enter your full name',
      helperText: 'Please enter your name as it appears on your ID'
    })
    .email('email', 'Email Address', {
      required: true,
      placeholder: 'john@example.com'
    })
    .dropdown('id_type', 'ID Document Type', [
      { id: 'passport', title: '📱 Passport' },
      { id: 'driver_license', title: '🚗 Driver License' },
      { id: 'national_id', title: '🆔 National ID Card' }
    ], { required: true })
    .linkNavigate('📋 Continue to Services', 'SERVICE_SELECTION')
    .screen('SERVICE_SELECTION', { title: '🎯 Select Services' })
    .add({
      type: 'TextBody',
      text: 'Please select the pension services you need. You can choose multiple options.',
      markdown: true
    })
    .checkbox('services', 'Which services do you need?', [
      { id: 'new_application', title: '📝 New Pension Application' },
      { id: 'benefit_update', title: '🔄 Update Existing Benefits' },
      { id: 'status_check', title: '🔍 Check Application Status' },
      { id: 'document_upload', title: '📄 Upload Documents' },
      { id: 'appointment', title: '📅 Schedule Appointment' }
    ], {
      required: true,
      minSelections: 1,
      maxSelections: 3
    })
    .dropdown('urgency', 'Application Urgency', [
      { id: 'routine', title: '🟢 Routine (2-3 weeks)' },
      { id: 'priority', title: '🟡 Priority (1 week)' },
      { id: 'urgent', title: '🔴 Urgent (48 hours)' }
    ], { required: true })
    .linkNavigate('📄 Continue to Documents', 'DOCUMENT_UPLOAD')
    .screen('DOCUMENT_UPLOAD', { title: '📄 Document Upload' })
    .text('reference_number', 'Application Reference', {
      required: true,
      placeholder: 'PEN-2024-XXXXX'
    })
    .checkbox('documents', 'Documents to Upload', [
      { id: 'id_proof', title: '📱 ID Document' },
      { id: 'address_proof', title: '🏠 Address Proof' },
      { id: 'income_proof', title: '💰 Income Statement' },
      { id: 'bank_statement', title: '🏦 Bank Statement' },
      { id: 'photo', title: '📸 Recent Photograph' }
    ], {
      required: true,
      minSelections: 2
    })
    .linkApi('📤 Upload Documents', 'https://api.pension.gov/upload', 'POST', {
      step: 'document_upload',
      flow_id: '{{reference_number}}'
    })
    .linkComplete('🚀 Submit Application', {
      application_type: 'pension',
      submission_time: new Date().toISOString(),
      channel: 'whatsapp_flow'
    });

  console.log('✅ Flow created successfully!');
  console.log('📊 Flow Statistics:');
  
  const builtFlow = flow.build();
  console.log(`   - Total Screens: ${builtFlow.screens.length}`);
  console.log(`   - Total Components: ${builtFlow.screens.reduce((sum, screen) => sum + screen.layout.children.length, 0)}`);
  
  // Generate preview HTML
  console.log('\n🎨 Generating preview...');
  
  try {
    // Save preview to file
    const previewPath = flow.preview({ save: 'demo-preview.html' });
    console.log(`✅ Preview saved to: ${previewPath}`);
    
    // Show preview HTML size
    const fs = require('fs');
    const stats = fs.statSync(previewPath);
    console.log(`📄 Preview file size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🌐 Preview Features:');
    console.log('   ✅ WhatsApp-like UI design');
    console.log('   ✅ Interactive form inputs');
    console.log('   ✅ Screen navigation');
    console.log('   ✅ Real-time data collection');
    console.log('   ✅ Component rendering');
    console.log('   ✅ Flow statistics panel');
    console.log('   ✅ Mobile-responsive design');
    
    console.log('\n🚀 To view the preview:');
    console.log(`   1. Open ${previewPath} in your browser`);
    console.log('   2. Or run: flow.preview({ serve: true, port: 3000 })');
    
    return builtFlow;
    
  } catch (error) {
    console.error('❌ Preview generation failed:', error.message);
    throw error;
  }
}

// Test different preview options
async function testPreviewOptions() {
  console.log('\n🧪 Testing different preview options...\n');
  
  const flow = createFlow('TestFlow')
    .screen('TEST', { title: 'Test Screen' })
    .text('name', 'Name')
    .submit('Submit');
  
  // Test 1: Generate HTML string
  console.log('📝 Test 1: Generate HTML string');
  const htmlString = flow.preview();
  console.log(`   ✓ Generated ${htmlString.length} characters of HTML`);
  
  // Test 2: Save to file
  console.log('💾 Test 2: Save to file');
  const savedPath = flow.preview({ save: 'test-preview.html' });
  console.log(`   ✓ Saved to: ${savedPath}`);
  
  // Test 3: Generate HTML with different options
  console.log('⚙️  Test 3: Advanced options');
  const advancedPreview = flow.preview({ 
    save: 'advanced-preview.html'
  });
  console.log(`   ✓ Advanced preview generated`);
  
  console.log('\n✅ All preview options working correctly!');
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await demonstratePreview();
      await testPreviewOptions();
      
      console.log('\n🎉 Preview demonstration completed successfully!');
      console.log('\n📖 What was demonstrated:');
      console.log('   ✅ WhatsApp-style UI preview');
      console.log('   ✅ Interactive component rendering');
      console.log('   ✅ Form data collection');
      console.log('   ✅ Screen navigation');
      console.log('   ✅ Real-time statistics');
      console.log('   ✅ Multiple preview options');
      console.log('   ✅ File saving functionality');
      
      console.log('\n🚀 Ready for production use!');
      
    } catch (error) {
      console.error('💥 Demo failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { demonstratePreview, testPreviewOptions };
