let rls = require('readline-sync');

let bool = async function(question){
    return rls.keyInYN(question);
}

let select = async function(options, question, returnType){      
  for(let i = 0; i < options.length; i++){
    let option = options[i];
    if(typeof(option) === 'object'){
      console.log(`[${i}]   ${option.text}`)
    }else{
      console.log(`[${i}]   ${option}`)
    }
  }
  let index = -1;
  let breakLoop = false;
  do{
    index = rls.questionInt(question+"   ");
    if(!options[index]) {
      console.log('Please enter a value between 0 - ' + (options.length-1));
    }else{
      breakLoop = true;
    }
    
  }while(!breakLoop);
  return returnType === 'index' ? index : typeof(options[index]) === 'object' ? options[index].value : options[index]
}

module.exports={
    select,
    bool
}