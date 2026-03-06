const { createFlow } = require("./index");
const bind = require("./src/utils/bind");
const { ErrorHandler, FlowError } = require('./src/core/ErrorHandler');

try {
  if (!createFlow) {
    throw new Error('Failed to import createFlow from index');
  }
  
  if (!bind || !bind.data) {
    throw new Error('Failed to import bind utility');
  }
  
  const flow = createFlow("SERVICES")
    .screen("SERVICES", bind.data("screenName"))
    .textBody(bind.data("textBody"))
    .dropdown(
        "OServiceCategory",
        bind.data("ListServiceCategory")
    )
    .footer(bind.data("LFooter"));

  if (!flow) {
    throw new Error('Failed to create flow');
  }
  
  const builtFlow = flow.build();
  
  if (!builtFlow) {
    throw new Error('Failed to build flow');
  }
  
  console.log(JSON.stringify(builtFlow, null, 2));
  
} catch (error) {
  ErrorHandler.handle(error, { method: 'build.js.main' });
  
  if (error instanceof FlowError) {
    console.error(`Flow Error [${error.code}]: ${error.message}`);
    if (error.details && Object.keys(error.details).length > 0) {
      console.error('Details:', error.details);
    }
  } else {
    console.error('Build failed:', error.message);
  }
  
  process.exit(1);
}