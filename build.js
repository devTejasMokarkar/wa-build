const { createFlow } = require("./index");
const bind = require("./src/utils/bind");

// HINT: This is a simple flow builder example
// - createFlow(name) creates a new flow
// - .screen(id, title) adds a screen
// - .textBody(content) adds text content
// - .dropdown(name, dataSource) adds dropdown
// - .footer(label) adds action button
// - .build() compiles the flow to JSON

const flow = createFlow("SERVICES")
  .screen("SERVICES", bind.data("screenName"))
  .textBody(bind.data("textBody"))
  .dropdown("OServiceCategory", bind.data("ListServiceCategory"))
  .footer(bind.data("LFooter"));

console.log(JSON.stringify(flow.build(), null, 2));