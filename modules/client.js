const fs = require('fs');
const url = require('url')
const path = require('path');
const rimraf = require("rimraf");

module.exports = {
    run: (req, res) => {
        if(req.method == "POST"){
            switch (req.body.action) {
                case "getInfo":
                    let id = global.functions.token.get(url.parse(req.url, true).query.token).info.id
                    global.functions.mongodb.findOne("client", {
                        id: id
                    },{
                        projection:{
                            _id: 0
                        }
                    }).then((rep) => {
                        res.send({
                            guide: rep.guide.name,
                            date: rep.date,
                            numFile: rep.numFile,
                            statut: rep.statut
                        })
                    })
                    break;
            
                default:
                    break;
            }
        }
        else{
            switch (url.parse(req.url, true).query.action) {
                case "download":
                    let id = global.functions.token.get(url.parse(req.url, true).query.token).info.id
                    global.functions.mongodb.findOne("client", {
                        id: id
                    },{
                        projection:{
                            _id: 0,
                            statut: 1
                        }
                    }).then((rep) => {
                        if(rep.statut == "fermer"){
                            return
                        }
                        if(fs.existsSync("./images/zip/" + id + ".zip")){
                            global.functions.mongodb.updateOne("client", {
                                id: id
                            },
                            {
                                $inc: {numdl: 1}
                            }).then(() =>{
                                res.download(path.resolve("images/zip") + "/" + id + ".zip")
                            })
                        }
                    })
                    
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
        if(url.parse(req.url, true).query.token && global.functions.token.exist(url.parse(req.url, true).query.token) && global.functions.token.get(url.parse(req.url, true).query.token).info.type == "client"){
            return true
        }
        else{
            return false
        }
        
    },
}