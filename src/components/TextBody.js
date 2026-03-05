class TextBody{

constructor(text, markdown=true){
    this.text = text;
    this.markdown = markdown;
}

build(){
    return {
        type: "TextBody",
        markdown: this.markdown,
        text: this.text
    }
}

}

module.exports = TextBody;