const Flow = require('../src/core/Flow');
const Router = require('../src/core/Router');

// Import screens
const welcomeScreen = require('../screens/Welcome.screen');
const purposeScreen = require('../screens/Purpose.screen');
const uploadScreen = require('../screens/Upload.screen');

// Create flow
const flow = new Flow('PensionFlow', {
  version: '2.0.0',
  dataApiVersion: '3.0'
});

// Add screens
flow.screen(welcomeScreen);
flow.screen(purposeScreen);
flow.screen(uploadScreen);

// Set up routing
const router = new Router();

router
  .addRoute('WELCOME', 'PURPOSE')
  .addRoute('PURPOSE', 'UPLOAD')
  .setDefault('WELCOME');

// Add conditional routing
router.addCondition('services_selected', (data) => {
  return data.services && data.services.length > 0;
});

router.addCondition('has_reference', (data) => {
  return data.reference_number && data.reference_number.trim().length > 0;
});

// Apply routing model
const routingModel = router.buildRoutingModel();
flow.routing(routingModel);

module.exports = flow;
