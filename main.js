const express = require('express')
const app = express()
const server = require('http').createServer(app)
const fs = require("fs")
const url = require('url')
const io = require("socket.io")(server)
global.dir = __dirname

const modules = {}
fs.readdir(__dirname + '/modules', (err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return
        modules[file.replace(".js", "")] = require(__dirname + `/modules/${file}`)
	})
})

global.functions = {}
fs.readdir(__dirname + '/functions', (err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return
        global.functions[file.replace(".js", "")] = require(__dirname + `/functions/${file}`)
	})
})

global.json = {}
fs.readdir(__dirname + '/json', (err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.json')) return
        global.json[file.replace(".json", "")] = require(__dirname + `/json/${file}`)
	})
})

app.set('view engine', 'ejs')
app.set('views', global.dir + '/views');
app.use('/public', express.static(global.dir + '/public'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}))
app.set('trust proxy', true);

app.use("*", (req, res) => {
    if(req.params[0].replace(/\//g, "") == ""){
        if(req.method == "GET"){
            res.render("index")
        }
        else{
            modules["index"].run(req, res)
        }
    }
    else if(req.method == "GET" && !url.parse(req.url, true).query.get && modules[req.params[0].replace(/\//g, "")] && modules[req.params[0].replace(/\//g, "")].acces(req)){
        res.render(req.params[0].replace(/\//g, ""), modules[req.params[0].replace(/\//g, "")].parms())
    }
    else if((req.method == "POST" || url.parse(req.url, true).query.get) && modules[req.params[0].replace(/\//g, "")] && modules[req.params[0].replace(/\//g, "")].acces(req)){
        modules[req.params[0].replace(/\//g, "")].run(req, res)
    }
})

io.on('connection', (socket) => {
    if(socket.handshake.auth.module){
        modules[socket.handshake.auth.module].socketRun(socket, socket.handshake.auth)
    }
})

server.listen(6080, () => {
    console.log('Serving on port 6080');
})