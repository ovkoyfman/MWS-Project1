if(navigator.serviceWorker){
    navigator.serviceWorker.register('/js/sw.js').then(
        function(registration){
            //console.log("Success! - ", registration);
            console.log("Success!");
        }
    ).catch(
        function(e){
            console.log("Error:", e)
        }
    )
}