class TextBody {

constructor(text, markdown = true, options = {}){
    if (!text) throw new Error('TextBody text is required');
    
    this.text = text;
    this.markdown = markdown;
    this.style = options.style || 'body';
    this.align = options.align || 'left';
    this.color = options.color || null;
}

build(){
    const component = {
        type: "TextBody",
        text: this.text,
        markdown: this.markdown
    };

    if (this.style !== 'body') component.style = this.style;
    if (this.align !== 'left') component.align = this.align;
    if (this.color) component.color = this.color;

    return component;
}

}

module.exports = TextBody;