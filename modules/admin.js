const url = require('url')

module.exports = {
    run: (req, res) => {
        if(req.method == "POST"){
            switch (req.body.action) {
                case "idAdmin":
                    global.functions.mongodb.find("admin", {

                    },
                    {
                        projection:{
                            _id: 0
                        }
                    }, 0, 1).then((rep) => {
                        res.send(rep)
                    })
                    break;
                case "modifAdmin":
                    global.functions.mongodb.updateOne("admin", {
                        id: req.body.id
                    },{
                        $set:{
                            id: req.body.newId
                        }
                    }).then(() => {
                        res.send({
                            status: "successful",
                            info: global.json.words.admin.successfulModif
                        })
                    })

                    break;

                case "createGuide":
                    global.functions.mongodb.findOne("guide", {
                        id: req.body.id
                    }, {
                        projection:{
                            _id: 0
                        }
                    }).then((rep) => {
                        if(rep){
                            res.send({
                                statut: "error",
                                info: global.json.words.admin.alreadyExist
                            })
                        }
                        else{
                            global.functions.mongodb.insertOne("guide", {
                                id: req.body.id,
                                name: req.body.name
                            })
                            res.send({
                                statut: "successful",
                                info: global.json.words.admin.successful
                            })
                        }
                    })

                    break;

                case "listGuide":
                    global.functions.mongodb.find("guide",{

                    }, {
                        projection:{
                            _id: 0
                        }
                    }, 0, 0).then((rep) => {
                        res.send(rep)
                    })

                    break;

                case "modifGuide":
                    global.functions.mongodb.updateOne("guide", {
                        id: req.body.id
                    }, {
                        $set:{
                            id: req.body.newId,
                            name: req.body.newName
                        }
                    }).then(() => {
                        res.send({
                            statut: "successful",
                                info: global.json.words.admin.successfulModif
                        })
                    })
                    break;

                case "supGuide":
                    global.functions.mongodb.deleteOne("guide", {
                        id: req.body.id
                    }).then(() => {
                        res.send({
                            statut: "successful",
                                info: global.json.words.admin.successfulSup
                        })
                    })
                    break;
            
                default:
                    break;
            }
        }
        else{
            switch (url.parse(req.url, true).query.action) {
                case "":
                    
                    break;
            
                default:
                    break;
            }
        }
        
    },
    parms: () => {
        return {

        }
    },
    acces: (req) => {
        if(url.parse(req.url, true).query.token && global.functions.token.exist(url.parse(req.url, true).query.token) && global.functions.token.get(url.parse(req.url, true).query.token).info.type == "admin"){
            return true
        }
        else{
            return false
        }
        
    },
}