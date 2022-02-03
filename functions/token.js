const list = {}

module.exports = {
    make: (info) => {
        let token = false
        while(!token){
            let temp = ""
            for(let t = 0; t < 3; t++){
                temp += Math.random(0).toString(36).substr(2)
            }
            if(!list[temp]){
                token = temp
                list[temp] = {
                    info: info,
                    timeout: setTimeout(() => {
                        delete list[temp]
                    }, 600000)
                }
            }
        }
        return token
    },
    get: (token) => {
        if(list[token]){
            clearTimeout(list[token].timeout)
            delete list[token].timeout
            list[token].timeout = setTimeout(() => {
                delete list[token]
            }, 600000)
            return list[token]
        }
        else{
            return false
        }
    },
    exist: (token) => {
        if(list[token]){
            clearTimeout(list[token].timeout)
            delete list[token].timeout
            list[token].timeout = setTimeout(() => {
                delete list[token]
            }, 600000)
            return true
        }
        else{
            return false
        }
    },
    delete: (token) => {
        if(list[token]){
            delete list[token]
        }
    },
    list: () => {
        return list
    }
}