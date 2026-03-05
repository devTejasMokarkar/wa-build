class CheckboxGroup {

constructor(name,label,dataSource){

this.name = name;
this.label = label;
this.dataSource = dataSource;

}

build(){

return {
type:"CheckboxGroup",
name:this.name,
label:this.label,
"data-source":this.dataSource
};

}

}

module.exports = CheckboxGroup;