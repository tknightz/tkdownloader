let input = document.getElementById('input_link');

function checkValid(str) {
    let patt = /https:\/\/www\.youtube\.com\/watch\?v=.{11}/i;
    let result = str.match(patt);
    if(result){
        getVideo(result);   
    };
    return false;
}

function getVideo(link){
    let xhr = new XMLHttpRequest();
    let endpoint = 'localhost:5000/getinfo';
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        "link" : link
    }));
    
    xhr.onreadystatechange = function () {
    if (this.readyState != 4) return;

    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        // we get the returned data
    }
    // end of state change: it can be after some time (async)
    };
}

input.addEventListener('input', function(){
    if(checkValid(input.value)) console.log('True');
})

