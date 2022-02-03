toModule({
    action: "getInfo"
}).then((rep) => {
    console.log(rep);
    document.getElementById("guide").innerText = "Guide de l'activité: " + rep.guide
    document.getElementById("date").innerText = "Photos posté le: " + new Date(rep.date).toISOString().split("T")[0]
    document.getElementById("numFile").innerText = "Nombre de fichier: " + rep.numFile
    document.getElementById("statut").innerText = "statut: " + rep.statut
    if(rep.statut == "fermer"){
        document.getElementById("button1").remove()
    }
    
})

document.getElementById("button1").onclick = () => {
    
    let flag = false;
    let div = document.createElement("div")
    div.className = "displayImage"
    let divConfirm = document.createElement("div")
    divConfirm.className = "divConfirm"
    let divCrois = document.createElement("div")
    divCrois.className = "divCrois"
    let crois = document.createElement("a")
    crois.innerText = "X"
    crois.className = "crois"
    crois.onclick = () => {
        if(flag){
            return
        }
        div.remove()
    }
    divCrois.appendChild(crois)
    divConfirm.appendChild(divCrois)
    
    let txt1 = document.createElement("a")
    txt1.innerText = "Voulez vous nous laisser un avis ?"
    txt1.className = "txt1"
    divConfirm.appendChild(txt1)

    let divchoi = document.createElement("div")
    divchoi.className = "divChoi"

    let tripLogo = document.createElement("img")
    tripLogo.src = "/public/images/TripAdvisor-logo.png"
    tripLogo.className = "tripLogo"
    tripLogo.onclick = () => {
        window.open(window.location.href + "&get=true&action=download", '_blank')
        setTimeout(() => {
            window.location.href = "https://www.tripadvisor.fr/Attraction_Review-g677532-d1056685-Reviews-Bureau_des_Guides_de_Canyon-Castellane_Alpes_de_Haute_Provence_Provence_Alpes_Cot.html?m=19905"
        }, 100);
    }
    divchoi.appendChild(tripLogo)

    let ggLogo = document.createElement("img")
    ggLogo.src = "/public/images/google-b-logo.png"
    ggLogo.className = "tripLogo"
    ggLogo.onclick = () => {
        window.open(window.location.href + "&get=true&action=download", '_blank')
        setTimeout(() => {
            window.location.href = "https://goo.gl/maps/pYjAKpZznXexRV3n7"
        }, 100);
    }
    divchoi.appendChild(ggLogo)
    divConfirm.appendChild(divchoi)

    let divDmd = document.createElement("div")
    divDmd.className = "divDmd"

    let txt3 = document.createElement("a")
    txt3.innerText = "Non merci."
    txt3.className = "txt3"
    txt3.onclick = () => {
        window.open(window.location.href + "&get=true&action=download", '_blank')
    }
    divDmd.appendChild(txt3)

    divConfirm.appendChild(divDmd)
    div.appendChild(divConfirm)
    document.body.appendChild(div)
}