let {prompt, Toggle } = require('enquirer');


let bool = async function(question){
    const prompt = new Toggle({
        message: question,
        enabled: 'Yes',
        disabled: 'No'
      });

      return await prompt.run()
      
}

let select = async function(options, question){       
      let answers = await prompt([{
        type: 'select',
        name: 'Answer',
        message: question,
        initial: 1,
        choices: options
      }]);
      return answers.Answer
}

module.exports={
    select,
    bool
}