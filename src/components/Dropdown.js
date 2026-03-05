class Dropdown{

constructor(name,label,dataSource){
    this.name = name;
    this.label = label;
    this.dataSource = dataSource;
}

build(){

return {
    type:"Dropdown",
    name:this.name,
    label:this.label,
    "data-source":this.dataSource
}

}

}

module.exports = Dropdown;