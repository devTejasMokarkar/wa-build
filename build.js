const Flow = require("./index");
const bind = require("./src/utils/bind");

const flow = new Flow();

flow
.screen("SERVICES", bind.data("screenName"))

.textBody(bind.data("textBody"))

.dropdown(
    "OServiceCategory",
    bind.data("ListServiceCategory")
)

.footer(bind.data("LFooter"));

console.log(JSON.stringify(flow.build(), null, 2));