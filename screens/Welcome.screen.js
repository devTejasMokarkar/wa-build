const Screen = require('../src/core/Screen');
const TextInput = require('../src/components/TextInput');
const TextBody = require('../src/components/TextBody');
const Footer = require('../src/components/Footer');

const screen = new Screen('WELCOME', {
  title: 'Welcome to Our Service',
  terminal: false
});

screen
  .add(new TextBody('Welcome! We\'re excited to help you get started. Please provide your information below.'))
  .add(new TextInput('full_name', 'Full Name', {
    required: true,
    placeholder: 'Enter your full name',
    maxLength: 100,
    helperText: 'Please enter your legal name as it appears on your ID'
  }))
  .add(new TextInput('email', 'Email Address', {
    required: true,
    inputType: 'email',
    placeholder: 'your.email@example.com',
    helperText: 'We\'ll use this to send you updates'
  }))
  .add(new Footer('Continue', 'navigate', 'PURPOSE'));

module.exports = screen;
