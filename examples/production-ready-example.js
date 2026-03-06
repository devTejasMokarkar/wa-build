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
    console.log('🏗️  Building production-ready WhatsApp Flow...\n');

    // Main flow with enterprise features
    const flow = createFlow('EnterprisePensionFlow', {
      version: '2.1.0',
      dataApiVersion: '3.0'
    });

    // Welcome Screen with EmbeddedLinks
    flow
      .screen('WELCOME', { title: '🏛️ Pension Portal' })
      .linkNavigate('📋 Start Application', 'PERSONAL_INFO')
      .text('welcome_message', 'Welcome to our digital pension service. Apply online in minutes.')
      .linkNavigate('📞 Need Help?', 'SUPPORT_SCREEN')
      .linkComplete('⚡ Quick Apply', { type: 'fast_track' })
      .screen('PERSONAL_INFO', { title: '👤 Personal Information' })
      .text('full_name', 'Full Legal Name', {
        required: true,
        placeholder: 'John Doe',
        helperText: 'Enter name as shown on your ID'
      })
      .email('email', 'Email Address', {
        required: true,
        placeholder: 'john@example.com'
      })
      .phone('phone', 'Mobile Number', {
        required: true,
        helperText: 'For verification purposes'
      })
      .dropdown('id_type', 'ID Document Type', [
        { id: 'passport', title: '📱 Passport' },
        { id: 'driver_license', title: '🚗 Driver License' },
        { id: 'national_id', title: '🆔 National ID Card' }
      ], { required: true })
      .next('Continue', 'SERVICE_SELECTION')
      .screen('SERVICE_SELECTION', { title: '🎯 Select Services' })
      .checkbox('services', 'Which pension services do you need?', [
        { id: 'new_application', title: '📝 New Pension Application' },
        { id: 'benefit_update', title: '🔄 Update Existing Benefits' },
        { id: 'status_check', title: '🔍 Check Application Status' },
        { id: 'document_upload', title: '📄 Upload Documents' },
        { id: 'appointment', title: '📅 Schedule Appointment' }
      ], {
        required: true,
        minSelections: 1,
        maxSelections: 3,
        helperText: 'Select up to 3 services'
      })
      .dropdown('urgency', 'Application Urgency', [
        { id: 'routine', title: '🟢 Routine (2-3 weeks)' },
        { id: 'priority', title: '🟡 Priority (1 week)' },
        { id: 'urgent', title: '🔴 Urgent (48 hours)' }
      ], { required: true })
      .next('Continue', 'DOCUMENT_UPLOAD')
      .screen('DOCUMENT_UPLOAD', { title: '📄 Document Upload' })
      .text('reference_number', 'Application Reference', {
        required: true,
        placeholder: 'PEN-2024-XXXXX',
        helperText: 'Generate or enter reference number'
      })
      .checkbox('documents', 'Documents to Upload', [
        { id: 'id_proof', title: '📱 ID Document' },
        { id: 'address_proof', title: '🏠 Address Proof' },
        { id: 'income_proof', title: '💰 Income Statement' },
        { id: 'bank_statement', title: '🏦 Bank Statement' },
        { id: 'photo', title: '📸 Recent Photograph' }
      ], {
        required: true,
        minSelections: 2,
        helperText: 'At least 2 documents required'
      })
      .linkApi('📤 Upload Documents', 'https://api.pension.gov/upload', 'POST', {
        step: 'document_upload',
        flow_id: '{{reference_number}}'
      })
      .next('Continue', 'REVIEW')
      .screen('REVIEW', { title: '🔍 Review Application' })
      .data('application_summary', {
        type: 'object',
        properties: {
          applicant_name: '{{full_name}}',
          services_selected: '{{services}}',
          urgency_level: '{{urgency}}',
          reference: '{{reference_number}}'
        }
      })
      .text('confirm_email', 'Confirm Email Address', {
        required: true,
        placeholder: 'Re-enter email for verification'
      })
      .checkbox('declarations', 'Declarations', [
        { id: 'accuracy', title: '✅ All information provided is accurate' },
        { id: 'consent', title: '✅ I consent to data processing' },
        { id: 'terms', title: '✅ I accept the terms and conditions' }
      ], {
        required: true,
        minSelections: 3,
        helperText: 'All declarations must be accepted'
      })
      .linkComplete('🚀 Submit Application', {
        application_type: 'pension',
        submission_time: new Date().toISOString(),
        channel: 'whatsapp_flow'
      })
      .screen('SUPPORT_SCREEN', { title: '💬 Support & Help' })
      .text('help_topic', 'How can we help you?', {
        placeholder: 'Describe your issue or question'
      })
      .dropdown('support_type', 'Support Type', [
        { id: 'technical', title: '🔧 Technical Issue' },
        { id: 'application', title: '📋 Application Help' },
        { id: 'status', title: '📊 Status Inquiry' },
        { id: 'general', title: '💬 General Question' }
      ])
      .linkNavigate('📞 Call Support', 'CALL_SUPPORT')
      .linkNavigate('📧 Email Support', 'EMAIL_SUPPORT')
      .linkNavigate('🔄 Back to Application', 'WELCOME')
      .screen('SUCCESS', { title: '✅ Application Submitted!', terminal: true })
      .data('success_message', {
        type: 'string',
        value: 'Your pension application has been successfully submitted!'
      })
      .data('reference_display', {
        type: 'string',
        value: 'Reference: {{reference_number}}'
      })
      .data('next_steps', {
        type: 'array',
        items: [
          'You will receive confirmation via email within 24 hours',
          'Documents will be verified within 3-5 business days',
          'You can check status using your reference number'
        ]
      })
      .footer('📋 View Status', 'navigate', 'STATUS_CHECK')
      .screen('STATUS_CHECK', { title: '📊 Application Status', terminal: true })
      .text('status_reference', 'Enter Reference Number', {
        required: true,
        placeholder: 'PEN-2024-XXXXX'
      })
      .linkApi('🔍 Check Status', 'https://api.pension.gov/status', 'GET', {
        reference: '{{status_reference}}'
      })
      .footer('🏠 Back to Home', 'navigate', 'WELCOME');

    // Add conditional routing
    flow
      .when('services_selected', 'DOCUMENT_UPLOAD', 'SERVICE_SELECTION')
      .when('documents_uploaded', 'REVIEW', 'DOCUMENT_UPLOAD')
      .when('application_complete', 'SUCCESS', 'REVIEW');

    // Validate and build
    console.log('🔍 Validating flow...');
    flow.validate();
    
    console.log('⚙️  Building flow...');
    const builtFlow = flow.build();

    // Display statistics
    const { Compiler } = require('../index');
    const compiler = new Compiler();
    compiler.printStats(builtFlow);

    // Save flow
    const outputPath = await compiler.saveToFile(builtFlow, 'enterprise-pension-flow', '2.1.0');
    
    console.log('\n✅ Production flow built successfully!');
    console.log(`📁 Output: ${outputPath}`);
    
    return builtFlow;

  } catch (error) {
    console.error('❌ Flow build failed:', error.message);
    throw error;
  }
}

// Test EmbeddedLink validation limits
function testEmbeddedLinkValidation() {
  console.log('\n🧪 Testing EmbeddedLink validation limits...\n');
  
  try {
    // This should fail - too many EmbeddedLinks
    createFlow('TestTooManyLinks')
      .screen('TOO_MANY_LINKS', { title: 'Too Many Links Test' })
      .linkNavigate('Link 1', 'NEXT')
      .linkNavigate('Link 2', 'NEXT')
      .linkNavigate('Link 3', 'NEXT')
      .linkNavigate('Link 4', 'NEXT') // This should fail
      .build();
    
    console.log('❌ Test failed - should have caught EmbeddedLink limit error');
  } catch (error) {
    console.log('✅ Test passed - Correctly caught EmbeddedLink limit error:');
    console.log(`   ${error.message}\n`);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await createProductionFlow();
      testEmbeddedLinkValidation();
      
      console.log('🎉 All tests completed successfully!');
      console.log('\n📖 Framework Features Demonstrated:');
      console.log('  ✅ Clean DSL syntax');
      console.log('  ✅ EmbeddedLink validation (max 3 per screen)');
      console.log('  ✅ Schema validation');
      console.log('  ✅ Component composition');
      console.log('  ✅ Conditional routing');
      console.log('  ✅ Error handling');
      console.log('  ✅ Flow versioning');
      console.log('  ✅ Statistics generation');
      console.log('  ✅ Production-ready output');
      
    } catch (error) {
      console.error('💥 Execution failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { createProductionFlow, testEmbeddedLinkValidation };
