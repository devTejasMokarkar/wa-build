const Screen = require('../src/core/Screen');
const CheckboxGroup = require('../src/components/CheckboxGroup');
const Dropdown = require('../src/components/Dropdown');
const Footer = require('../src/components/Footer');

const screen = new Screen('PURPOSE', {
  title: 'Select Your Services',
  terminal: false
});

screen
  .add(new CheckboxGroup('services', 'What services do you need?', [
    { id: 'electricity', title: 'Electricity Bill Payment' },
    { id: 'water', title: 'Water Bill Payment' },
    { id: 'gas', title: 'Gas Bill Payment' },
    { id: 'internet', title: 'Internet Bill Payment' },
    { id: 'phone', title: 'Phone Bill Payment' },
    { id: 'council_tax', title: 'Council Tax' },
    { id: 'tv_license', title: 'TV License' }
  ], {
    required: true,
    minSelections: 1,
    maxSelections: 5,
    helperText: 'Select up to 5 services you need help with'
  }))
  .add(new Dropdown('urgency', 'How urgent is this?', [
    { id: 'low', title: 'Low - Within a month' },
    { id: 'medium', title: 'Medium - Within 2 weeks' },
    { id: 'high', title: 'High - Within a week' },
    { id: 'urgent', title: 'Urgent - Within 24 hours' }
  ], {
    required: true,
    defaultValue: 'medium'
  }))
  .add(new Footer('Continue', 'navigate', 'UPLOAD'));

module.exports = screen;
