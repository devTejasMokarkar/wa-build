function data(key){
    return `\${data.${key}}`;
}

function form(key){
    return `\${form.${key}}`;
}

function screen(screenName){
    return `\${screen.${screenName}.form}`;
}

module.exports = { data, form, screen };
