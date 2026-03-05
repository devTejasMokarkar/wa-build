function buildAction(options = {}) {

if(options.navigate){
return {
name:"navigate",
next:{
type:"screen",
name:options.navigate
},
payload:options.payload || {}
};
}

if(options.complete){
return {
name:"complete",
payload:options.payload || {}
};
}

return null;

}

module.exports = buildAction;