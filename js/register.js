if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then(
        function(registration){
            console.log("Success!");
        }
    ).catch(
        function(e){
            console.log("Error:", e)
        }
    )
}