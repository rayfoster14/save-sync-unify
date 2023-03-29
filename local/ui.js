let rls = require('readline-sync');

let bool = async function(question){
    return rls.keyInYN(question);
}

let select = async function(options, question, returnType, back){    
  for(let i = 0; i < options.length; i++){
    let option = options[i];
    let displayIndex = i + (back?1:0)
    if(typeof(option) === 'object'){
      console.log(`[${displayIndex}]   ${option.text}`)
    }else{
      console.log(`[${displayIndex}]   ${option}`)
    }
  }
  if(back)console.log("\n[0]  < Back >")

  let index = -1;
  let breakLoop = false;
  do{
    index = rls.questionInt(question+"   ") - (back?1:0) ;
    if(!options[index] && index !== -1) {
      console.log('Please enter a value between 0 - ' + ((options.length-1) + (back?1:0)));
    }else{
      breakLoop = true;
    }
    
  }while(!breakLoop);
  if(back && index === -1) return undefined;
  return returnType === 'index' ? index : typeof(options[index]) === 'object' ? options[index].value : options[index]
}

let text = async function(question){
  return rls.question(question)
}

module.exports={
    select,
    bool,
    text
}