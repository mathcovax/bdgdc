const args = {}
if(window.location.href.indexOf("?") > -1){
    for(const arg of window.location.href.split("?")[1].split("&")){
        args[arg.split("=")[0]] = arg.split("=")[1]
    }
}

const socket = io({
    reconnectionDelayMax: 10000,
    auth: {
        module: "guide",
        token: args.token
    }
})

let PAGE = 0

document.getElementById("rightArrow").onclick = () => {
    if(uploadStatut){
        document.getElementById("label1").style.color = "red"
        document.getElementById("label1").innerText = "Vous ne pouvez pas effectuer cette action pour le moment."
        return
    }
    PAGE++
    display(PAGE)
}

document.getElementById("leftArrow").onclick = () => {
    if(uploadStatut){
        document.getElementById("label1").style.color = "red"
        document.getElementById("label1").innerText = "Vous ne pouvez pas effectuer cette action pour le moment."
        return
    }
    if(PAGE == 0) return
    PAGE--
    display(PAGE)
}

const create = async () => {
    if(document.getElementById("input1").value.length > 0 && !uploadStatut){
        document.getElementById("label1").style.color = "green"
        document.getElementById("label1").innerText = "Requête en cours."

        let rep = await toModule({
            action: "create",
            id: document.getElementById("input1").value
        })

        if(rep.statut == "successful"){
            document.getElementById("label1").style.color = "green"
            document.getElementById("input1").value = ""
            display(PAGE)
        }
        else{
            document.getElementById("label1").style.color = "red"
        }
        document.getElementById("label1").innerText = rep.info


    }
}

document.getElementById("button1").onclick = () => create()

async function display(page){
    let rep = await toModule({
        action: "list",
        page: page
    })
    document.getElementById("div3").innerHTML = ""
    document.getElementById("numPage").innerText = page
    for(const client of rep){
        let div = document.createElement("div")
        div.className = "divClient"

        let id = document.createElement("a")
        id.innerText = "id : " + client.id
        
        let divInfo = document.createElement("div")
        divInfo.className = "divClient1"
        let date = document.createElement("a")
        date.innerText = "Date : " + new Date(client.date).toISOString().split("T")[0]
        let numFile = document.createElement("a")
        numFile.innerText = "Nombre de fichier : " + client.numFile
        numFile.onclick = () => { displayImage(client.id) }
        numFile.className = "labelImg"
        let divStatut = document.createElement("div")
        divStatut.className = "divClient2"
        let statut = document.createElement("a")
        statut.innerText = "Statut :"
        divStatut.appendChild(statut)
        let buttonStatut = document.createElement("div")
        buttonStatut.className = (function (){
            if(client.statut == "fermer"){
                return "button4"
            }
            else if(client.statut == "ouvert"){
                return "button3"
            }
        })()
        buttonStatut.innerText = client.statut
        buttonStatut.onclick = async() => {
            console.log(client.numdl);
            if(client.numdl > 0 || uploadStatut){
                return
            }
            uploadStatut = true
            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = "Compréssion des fichiers en cours..."
            let rep = await toModule({
                action: "changeStatut",
                id: client.id
            })
            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = rep.info
            uploadStatut = false
            display(PAGE)

        }
        divStatut.appendChild(buttonStatut)
        let numdl = document.createElement("a")
        numdl.innerText = "Nombre de téléchragement : " + client.numdl

        let divInput = document.createElement("div")
        let inputFile = document.createElement("input")
        inputFile.type = "file"
        inputFile.multiple = true
        inputFile.accept = "image/jpeg, image/png, video/mp4"
        inputFile.addEventListener("change", async (event) => {
            upLoad(inputFile, client.id, divInput, inputFile, numFile)
        })
        divInput.appendChild(inputFile)
        if(client.numdl > 0 || client.statut == "ouvert"){
            divInput.innerHTML = ""
            divInput.innerText = "Plus possible d'ajouter des photo."
        }

        let button = document.createElement("div")
        button.innerText = "Suprimé"
        button.className = "button2"
        button.onclick = async () => {
            if(uploadStatut){
                document.getElementById("label1").style.color = "red"
                document.getElementById("label1").innerText = "Vous ne pouvez pas effectuer cette action pour le moment."
                return
            }
            let rep = await toModule({
                action: "delete",
                id: client.id
            })
            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = rep.info
            display(PAGE)
        }

        div.appendChild(id)
        divInfo.appendChild(date)
        divInfo.appendChild(numFile)
        divInfo.appendChild(divStatut)
        divInfo.appendChild(numdl)
        div.appendChild(divInfo)
        div.appendChild(divInput)
        div.appendChild(button)
        document.getElementById("div3").appendChild(div)

    }
}

display(PAGE)

async function displayImage(clientId){
    if(uploadStatut){
        document.getElementById("label1").style.color = "red"
        document.getElementById("label1").innerText = "Vous ne pouvez pas effectuer cette action pour le moment."
        return
    }
    let div = document.createElement("div")
    div.className = "displayImage"
    div.onclick = () => {
        div.remove()
        display(PAGE)
    }
    let rep = await toModule({
        action: "listFile",
        id: clientId
    })
    document.body.appendChild(div)
    if(rep.length == 0){
        let txt = document.createElement("a")
        txt.innerText = "Ancune Image."
        txt.style.color = "white"
        txt.style.fontSize = "20px"
        txt.style.marginTop = "30px"
        div.appendChild(txt)
    }
    for(const img of rep){
        let htmlImg = document.createElement("img")
        htmlImg.className = "hmltImg"
        htmlImg.src = window.location.href + "&get=true&action=getImage&id=" + clientId + "&img=" + img 
        htmlImg.onclick = async () => {
            if(confirm("Voulez vous supprimer l'image ?")) {
                let rep = await toModule({
                    action: "deleteFile",
                    id: clientId,
                    img: img
                })
                if(rep.statut == "successful"){
                    document.getElementById("label1").style.color = "green"
                }
                else{
                    document.getElementById("label1").style.color = "red"
                }
                document.getElementById("label1").innerText = rep.info
            }
            displayImage(clientId)
        }
        div.appendChild(htmlImg)
    }
}

let uploadStatut = false

async function upLoad(inputFile, clientId, divInput){
    if(uploadStatut){
        window.alert("Upload déjà en cours.")
        return
    }
    uploadStatut = true
    divInput.innerHTML = ""
    let numFile = 0

    for await(const file of inputFile.files){
        await new Promise(async (resolve) => {
            
            numFile++
            divInput.innerText = file.name + ": en attente " + numFile + "/" + inputFile.files.length
            let cutNumber = 0
            let cutSize = 500000
            let chunkSize = 100000
            let bytsSend = 0
            let now = Date.now()
            let cutSend = 0
            let loading = 0
            let directByts = 0

            let rep = await toModule({
                action: "startUpLoad",
                id: clientId,
                fileName: file.name,
                now: now
            })

            if(rep.statut == "error"){
                document.getElementById("label1").style.color = "red"
                document.getElementById("label1").innerText = rep.info + file.name
                bytsSend = file.size
                uploadStatut = false
                display(PAGE)
                return
            }

            while(bytsSend < file.size){
                (async function autolaunch(){
                    loading++
                    let tempCutNumber = cutNumber

                    let rep = await toModule({
                        action: "startCut",
                        id: clientId,
                        fileName: file.name,
                        cutNumber: tempCutNumber,
                        now: now
                    })

                    const reader = new FileReader();
                    let slice = file.slice(tempCutNumber * cutSize, tempCutNumber * cutSize + cutSize);
                    reader.readAsArrayBuffer(slice);
                    await new Promise(async (resolve) => {
                        reader.onload = async () => {
                            let result = arrayBufferToBase64(reader.result)
                            for(let byts = 0; byts <= result.length; byts += chunkSize){
                                let res = result.slice(byts, byts + chunkSize)
                                if(res.length == 0) break
                                let rep = await toModule({
                                    action: "upLoadChunk",
                                    id: clientId,
                                    fileName: file.name,
                                    chunk: res,
                                    cutNumber: tempCutNumber,
                                    now: now
                                })
                                directByts += Math.floor(res.length*cutSize/result.length)
                                divInput.innerText = file.name + ": " + (directByts/1024/1024).toFixed(1) + "/" + (file.size/1024/1024).toFixed(1) + " Mo " + numFile + "/" + inputFile.files.length
                            }
                            let rep = await toModule({
                                action: "endCut",
                                id: clientId,
                                fileName: file.name,
                                cutNumber: tempCutNumber,
                                now: now
                            })
                            cutSend++
                            loading--
                            resolve()
                        }
                    })
                })()
                
                if(loading >= 5){
                    await new Promise((resolve) => {
                        const interval = setInterval(async () => {
                            if(loading < 5){
                                clearInterval(interval)
                                resolve()
                            }
                        }, 100);
                    })
                }

                cutNumber++
                bytsSend += cutSize
            }
            await new Promise((resolve) => {
                const interval = setInterval(async () => {
                    if(cutSend >= file.size/cutSize){
                        clearInterval(interval)
                        toModule({
                            action: "endUpLoad",
                            id: clientId,
                            fileName: file.name,
                            now: now,
                            fileSize: file.size
                        })
                        resolve()
                    }
                }, 100);
            })
            resolve()
        })
    }
    uploadStatut = false
    display(PAGE)
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}