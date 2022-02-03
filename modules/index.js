module.exports = {
    run: (req, res) => {
        switch (req.body.action) {
            case "connect":
                    global.functions.mongodb.findOne(req.body.type, {
                        id: req.body.id
                    }, {
                        projection:{
                            _id: 0
                          }
                    }).then((rep) => {
                        if(rep && rep.id == req.body.id){
                            rep.type = req.body.type
                            res.send({
                                statut: "successful",
                                token: global.functions.token.make(rep),
                                type: req.body.type
                            })
                        }
                        else{
                            res.send({
                                statut: "error",
                                info: global.json.words.index.dontExist
                            })
                        }
                    })
                break;
        
            default:
                break;
        }
    }
}