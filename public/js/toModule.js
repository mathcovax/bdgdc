async function toModule(body){
    return await new Promise((resolve) => {
        fetch(window.location.href, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then( response => response.json() )
        .then( response => {
            resolve(response)
        })
        .catch((error) => {
            document.location.reload();
        })
    })
}