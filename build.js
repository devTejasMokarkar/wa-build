const { createFlow } = require("./index");
const bind = require("./src/utils/bind");

const flow = createFlow("SERVICES")
  .screen("SERVICES", bind.data("screenName"))
  .textBody(bind.data("textBody"))
  .textBody(bind.data("textBody2"))
  .dropdown("OServiceCategory", bind.data("ListServiceCategory"))
  .footer(bind.data("LFooter"));

console.log(JSON.stringify(flow.build(), null, 2));