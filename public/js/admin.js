toModule({
    action: "idAdmin"
}).then((rep) => {
    document.getElementById("adminInput").value = rep[0].id
    document.getElementById("modifButtonAdmin").onclick = async () => {
        if(document.getElementById("adminInput").value == rep[0].id){
            return
        }
        else if(document.getElementById("adminInput").value.length > 0){
            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = "Requête en cours."

            let temp = await toModule({
                action: "modifAdmin",
                id: rep[0].id,
                newId:  document.getElementById("adminInput").value
            })
            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = temp.info
        }
        else{
            document.getElementById("label1").style.color = "red"
            document.getElementById("label1").innerText = "Veuillez remplir le champ obligatoire."
        }
        
    }
})

document.getElementById("createButtonGuide").onclick = async () => {
    if(document.getElementById("guideIdInput").value.length > 0 && document.getElementById("guideNameInput").value.length > 0){
        let rep = await toModule({
            action: "createGuide",
            id: document.getElementById("guideIdInput").value,
            name: document.getElementById("guideNameInput").value
        })

        if(rep.statut == "successful"){
            document.getElementById("label1").style.color = "green"
        }
        else{
            document.getElementById("label1").style.color = "red"
        }
        document.getElementById("label1").innerText = rep.info
        document.getElementById("guideIdInput").value = ""
        document.getElementById("guideNameInput").value = ""
        display()
    }
    else{
        document.getElementById("label1").style.color = "red"
        document.getElementById("label1").innerText = "Veuillez remplir les champ obligatoire."
    }
}

async function display(){
    let rep = await toModule({
        action: "listGuide"
    })
    document.getElementById("divGuide").innerHTML = ""
    for(const guide of rep){
        let div = document.createElement("div")
        div.className = "div4"

        let divId = document.createElement("div")
        let txtId = document.createElement("a")
        txtId.innerText = "id:"
        divId.appendChild(txtId)
        let inputId = document.createElement("input")
        inputId.className = "input1"
        inputId.value = guide.id
        divId.appendChild(inputId)
        div.appendChild(divId)

        let divName = document.createElement("div")
        let txtName = document.createElement("a")
        txtName.innerText = "nom:"
        divName.appendChild(txtName)
        let inputName = document.createElement("input")
        inputName.className = "input1"
        inputName.value = guide.name
        divName.appendChild(inputName)
        div.appendChild(divName)

        let divButton = document.createElement("div")
        divButton.className = "div5"
        let button1 = document.createElement("div")
        button1.className = "button1"
        button1.innerText = "modifier"
        button1.onclick = async () => {
            let rep = await toModule({
                action: "modifGuide",
                id: guide.id,
                newId: inputId.value,
                newName: inputName.value
            })

            document.getElementById("label1").style.color = "green"
            document.getElementById("label1").innerText = rep.info
        }
        divButton.appendChild(button1)
        let button2 = document.createElement("div")
        button2.className = "button2"
        button2.innerText = "suprimer"
        button2.onclick = async () => {
            if(confirm("Voulez vous supprimer " + guide.name + " ?")){
                let rep = await toModule({
                    action: "supGuide",
                    id: guide.id, 
                })
                
                document.getElementById("label1").style.color = "green"
                document.getElementById("label1").innerText = rep.info
                display()
            }
            
        }
        divButton.appendChild(button2)
        div.appendChild(divButton)

        document.getElementById("divGuide").appendChild(div)
    }
    
}
display()