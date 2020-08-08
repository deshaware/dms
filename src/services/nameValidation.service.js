
const regExp = new RegExp('[<>:"\/\\|?*]','g');

const nameValidation = (name) => {
    if(regExp.test(name)) 
            throw new Error(`Invalid File ${fileName} , avoid using special characters such as [ < > : " / | ? * ] `);
    return
}

module.exports = nameValidation;