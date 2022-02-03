const args = {}
if(window.location.href.indexOf("?") > -1){
    for(const arg of window.location.href.split("?")[1].split("&")){
        args[arg.split("=")[0]] = arg.split("=")[1]
    }
}

let connect = async () => {
    if(document.getElementById("input1").value.length > 0){
        document.getElementById("label1").style.color = "green"
        document.getElementById("label1").innerText = "Requête en cours."
        
        let rep = await toModule({
            action: "connect",
            type: (function autolaunch(){
                if(document.getElementById("input1").value.indexOf("admin:") == 0){
                    return "admin"
                }
                else if(document.getElementById("input1").value.indexOf("guide:") == 0){
                    return "guide"
                }
                else{
                    return "client"
                }
            })(),
            id: (function autolaunch(){
                if(document.getElementById("input1").value.indexOf("admin:") == 0){
                    return document.getElementById("input1").value.replace("admin:", "")
                }
                else if(document.getElementById("input1").value.indexOf("guide:") == 0){
                    return document.getElementById("input1").value.replace("guide:", "")
                }
                else{
                    return document.getElementById("input1").value
                }
            })()
        })

        if(rep.statut == "successful"){
            window.location.href = window.location.origin + "/" + rep.type + "?token=" + rep.token
        }
        else{
            document.getElementById("label1").style.color = "red"
            document.getElementById("label1").innerText = rep.info
        }
    }
    else{
        document.getElementById("label1").style.color = "red"
        document.getElementById("label1").innerText = "Veuillez remplir le champ obligatoire."
    }
}

document.getElementById("button1").onclick = () => connect()

if(args.id){
    document.getElementById("input1").value = args.id
    connect()
}