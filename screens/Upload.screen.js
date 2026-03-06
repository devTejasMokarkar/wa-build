const Screen = require('../src/core/Screen');
const TextInput = require('../src/components/TextInput');
const CheckboxGroup = require('../src/components/CheckboxGroup');
const Footer = require('../src/components/Footer');

const screen = new Screen('UPLOAD', {
  title: 'Document Upload',
  terminal: true
});

screen
  .add(new TextInput('reference_number', 'Reference Number', {
    required: true,
    placeholder: 'Enter your reference number',
    helperText: 'This can be found on your bill or statement'
  }))
  .add(new TextInput('account_number', 'Account Number', {
    required: false,
    placeholder: 'Account number (if available)',
    helperText: 'Optional but helps us process faster'
  }))
  .add(new CheckboxGroup('documents', 'Documents to upload', [
    { id: 'id_proof', title: 'ID Proof (Passport/Driver License)' },
    { id: 'address_proof', title: 'Address Proof (Utility Bill)' },
    { id: 'income_proof', title: 'Income Proof (Payslips/Bank Statement)' },
    { id: 'bill_copy', title: 'Copy of Current Bill' },
    { id: 'previous_proof', title: 'Previous Payment Proof' }
  ], {
    required: true,
    minSelections: 1,
    helperText: 'Select documents you want to upload'
  }))
  .add(new Footer('Submit Application', 'complete'));

module.exports = screen;
