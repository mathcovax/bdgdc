const url = require('url')
const fs = require('fs')
const rimraf = require("rimraf");
const path = require('path');
const Canvas = require('canvas');
const zipdir = require('zip-dir');

const upLoadFile = {} 

module.exports = {
    run: (req, res) => {
        if (req.method == "POST") {
            switch (req.body.action) {
                case "create":
                    global.functions.mongodb.findOne("client", {
                        id: req.body.id
                    }, {
                        projection:{
                            _id: 0
                        }
                    }).then((rep) => {
                        if(rep){
                            res.send({
                                statut: "error",
                                info: global.json.words.guide.alreadyExist
                            })
                        }
                        else{
                            global.functions.mongodb.insertOne("client", {
                                id: req.body.id,
                                type: "photo",
                                guide: global.functions.token.get(url.parse(req.url, true).query.token).info,
                                date: Date.now(),
                                statut: "fermer",
                                numFile: 0,
                                numdl: 0
    
                            }).then(() => {
                                fs.mkdirSync(global.dir + "/images/" + req.body.id)
                                res.send({
                                    statut: "successful",
                                    info: global.json.words.guide.successful
                                })
                            })
                        }
                    })
                    break;
    
                case "list":
                    global.functions.mongodb.find("client", {
                        "guide.id": global.functions.token.get(url.parse(req.url, true).query.token).info.id
                    }, {
                        projection:{
                            _id: 0,
                            guide: 0
                        }
                    }, req.body.page*10, 10).then((rep) => {
                        res.send(rep)
                    })
                    break;

                case "listFile":
                    res.send(fs.readdirSync(global.dir + "/images/" + req.body.id))

                    break;

                case "changeStatut":
                    global.functions.mongodb.findOne("client", {
                        id: req.body.id
                    },{
                        projection:{
                            _id: 0,
                            statut: 1,
                            numdl: 1
                        }
                    }).then((rep) => {
                        if(rep.statut == "ouvert" && rep.numdl == 0){
                            global.functions.mongodb.updateOne("client", {id: req.body.id}, {$set: {statut: "fermer"}}).then(() => {res.send({statut: "successful", info: global.json.words.guide.changeStatut})})
                        }
                        else if(rep.statut == "fermer" && rep.numdl == 0){
                            global.functions.mongodb.updateOne("client", {
                                id: req.body.id
                            }, {
                                $set: {
                                    statut: "ouvert"
                                }
                            }).then(() => {
                                if(fs.existsSync(global.dir + "/images/zip/" + req.body.id + ".zip")){
                                    fs.unlinkSync(global.dir + "/images/zip/" + req.body.id + ".zip")
                                }
                                zipdir(global.dir + "/images/" + req.body.id + "/", { saveTo: path.resolve("images/zip") + "/" + req.body.id + ".zip" }).then(() => {
                                    res.send({
                                        statut: "successful", 
                                        info: global.json.words.guide.changeStatut
                                    })
                                })
                            })
                        }
                    })

                    break;
    
                case "delete":
                    global.functions.mongodb.deleteOne("client", {
                        id: req.body.id
                    }).then(() => {
                        rimraf.sync(global.dir + "/images/" + req.body.id)
                        if(fs.existsSync(global.dir + "/images/zip/" + req.body.id + ".zip")){
                            fs.unlinkSync(global.dir + "/images/zip/" + req.body.id + ".zip")
                        }
                        res.send({
                            statut: "successful",
                            info: global.json.words.guide.successfulDelete
                        })
                    })

                    break;

                case "deleteFile":
                    global.functions.mongodb.findOne("client", {
                        id: req.body.id
                    },{
                        projection:{
                            _id: 0,
                            statut: 1
                        }
                    }).then((rep) =>{
                        if(rep.statut == "ouvert"){
                            res.send({
                                statut: "error",
                                info: global.json.words.guide.errorDelImage
                            })
                        }
                        else{
                            fs.unlinkSync(global.dir + "/images/" + req.body.id + "/" + req.body.img)
                            global.functions.mongodb.updateOne("client", {
                                id: req.body.id
                            },
                            {
                                $set: {numFile: fs.readdirSync(global.dir + "/images/" + req.body.id).length}
                            }).then(() => {
                                res.send({
                                    statut: "successful",
                                    info: global.json.words.guide.delImage
                                })
                            })
                        }
                    })
                    

                    break;

                case "startUpLoad":
                    if(fs.existsSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName)){
                        fs.unlinkSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName)
                        /*res.send({
                            statut: "error",
                            info: global.json.words.guide.alreadyExistFile
                        })*/
                    }
                    else{
                        if(!upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                            upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id] = {}
                        }
                        fs.writeFileSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName, "", 'base64')
                        upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id][req.body.fileName + req.body.now + req.body.id] = {
                            av: 0
                        }
                        res.send({
                            statut: "successful"
                        })
                    }
                    
                    break;
    
                case "startCut":
                    if(!upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                        res.send({
                            statut: "error"
                        })
                        return
                    }
                    upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id][req.body.fileName + req.body.now + req.body.id][req.body.cutNumber] = {
                        chunk: "",
                        finish: false
                    }
                    res.send({
                        statut: "successful"
                    })
    
                    break;
    
                case "upLoadChunk":
                    if(!upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                        res.send({
                            statut: "error"
                        })
                        return
                    }
                    upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id][req.body.fileName + req.body.now + req.body.id][req.body.cutNumber].chunk += req.body.chunk
                    res.send({
                        statut: "successful"
                    })
    
                    break;
    
                case "endCut":
                    if(!upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                        res.send({
                            statut: "error"
                        })
                        return
                    }
                    upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id][req.body.fileName + req.body.now + req.body.id][req.body.cutNumber].finish = true
                    append(global.dir + "/images/" + req.body.id + "/" + req.body.fileName, req.body.fileName + req.body.now + req.body.id, req.body.cutNumber, global.functions.token.get(url.parse(req.url, true).query.token).info.id)
                    res.send({
                        statut: "successful"
                    })
    
                    break;
    
                case "endUpLoad":
                    if(!upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                        res.send({
                            statut: "error"
                        })
                        return
                    }
                    const interval = setInterval(() => {
                        if(fs.lstatSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName).size == req.body.fileSize){
                            clearInterval(interval)
                            if(upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id]){
                                delete upLoadFile[global.functions.token.get(url.parse(req.url, true).query.token).info.id][req.body.fileName + req.body.now + req.body.id]
                            }
                            
                            global.functions.mongodb.updateOne("client", {
                                id: req.body.id
                            },
                            {
                                $set: {numFile: fs.readdirSync(global.dir + "/images/" + req.body.id).length}
                            }).then(async () => {
                                if(req.body.fileName.toLowerCase().indexOf(".png") > -1 || req.body.fileName.toLowerCase().indexOf(".jpg") > -1){
                                    const background = await Canvas.loadImage(global.dir + "/images/" + req.body.id + "/" + req.body.fileName);
                                    const canvas = Canvas.createCanvas(background.width, background.height);
                                    const context = canvas.getContext('2d');
                                    context.drawImage(background, 0, 0);
                                    const logo = await Canvas.loadImage(global.dir + "/public/images/logo.png")
                                    context.drawImage(logo, 50, 50, logo.width, logo.height);
                                    const buffer = canvas.toBuffer('image/png')
                                    fs.unlinkSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName)
                                    fs.writeFileSync(global.dir + "/images/" + req.body.id + "/" + req.body.fileName, buffer)
                                }
                                res.send({
                                    statut: "successful"
                                })
                            })
                        }
                    }, 100);
    
                    break;
            
                default:
                    break;
            }
        }
        else{
            switch (url.parse(req.url, true).query.action) {
                case "getImage":
                    res.sendFile(path.resolve("images/" + url.parse(req.url, true).query.id + "/" + url.parse(req.url, true).query.img))
                    break;
            
                default:
                    break;
            }
        }
        
    },
    socketRun: (socket, auth) => {
        if(!global.functions.token.exist(auth.token)){
            return
        }
        let id = global.functions.token.get(auth.token).info.id
        socket.on("disconnect", () =>{
            if(upLoadFile[id]){
                delete upLoadFile[id]
            }
        })
    },
    parms: () => {
        return {

        }
    },
    acces: (req) => {
        if(url.parse(req.url, true).query.token && global.functions.token.exist(url.parse(req.url, true).query.token) && global.functions.token.get(url.parse(req.url, true).query.token).info.type == "guide"){
            return true
        }
        else{
            return false
        }
        
    },
}

function append(file, name, cut, guide){
    if(upLoadFile[guide] && upLoadFile[guide][name] && upLoadFile[guide][name].av == cut && upLoadFile[guide][name][cut] && upLoadFile[guide][name][cut].finish){
        let temp = upLoadFile[guide][name][cut].chunk
        delete upLoadFile[guide][name][cut]
        upLoadFile[guide][name].av++
        fs.appendFileSync(file, temp, 'base64')
        append(file, name, cut+1, guide)
    }
    return
}