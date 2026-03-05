class TextInput {

constructor(name,label,required=true,inputType="text"){
this.name = name;
this.label = label;
this.required = required;
this.inputType = inputType;
}

build(){
return {
type:"TextInput",
name:this.name,
label:this.label,
required:this.required,
"input-type":this.inputType
};
}

}

module.exports = TextInput;