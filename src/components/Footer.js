class Footer {

constructor(label, action="complete", nextScreen=null){

this.label = label;
this.action = action;
this.nextScreen = nextScreen;

}

build(){

const footer = {
type: "Footer",
label: this.label
};

if(this.action === "navigate" && this.nextScreen){

footer["on-click-action"] = {
name: "navigate",
next: {
type: "screen",
name: this.nextScreen
},
payload: {}
};

}else{

footer["on-click-action"] = {
name: "complete",
payload: {}
};

}

return footer;

}

}

module.exports = Footer;