let simpleGit = require('simple-git');
let fs = require('fs');

let exists = async function(path){
    if(fs.existsSync(path)){
        let git = await simpleGit(path);
        let response = await git.checkIsRepo()
        return response
    }
    return false
}

let add = async function(path){
    let git = await simpleGit(path);
    let state = await git.status();

    let notAdded =state.not_added;
    let modified =state.modified;

    if(notAdded.length > 0 || modified.length > 0 ){  
        for(let i = 0; i < modified.length; i++){
            await git.add(modified[i]);
        }
        for(let i = 0; i < notAdded.length; i++){
            await git.add(notAdded[i]);
        }
        await git.commit(c.functions.numberDate());
        return true;
    }else{
        return false;
    }
}

let push = async function(path){
    let git = await simpleGit(path);
    let res = await git.push(['-u','origin', 'master']);
    return res;
}

module.exports = {
    exists,
    add,
    push

}