let input = document.getElementById('input_link');
let video_image = document.getElementById('video_image');
let video_title = document.getElementById('video_title');
let video_channel = document.getElementById('video_channel');
let loading = document.getElementById('loading');
let info_video = document.getElementById('info_video');
let error_info = document.getElementById('error_info');
let dl_audio = document.getElementById('dl_audio');
let dl_video = document.getElementById('dl_video');
let spinner_audio = document.getElementById('spinner_audio');
let text_dl_audio = document.getElementById('text_dl_audio');
let spinner_video = document.getElementById('spinner_video');
let text_dl_video = document.getElementById('text_dl_video');

let id = '';
let url = '';
let title = '';
let clickedAudio = true;
let clickedVideo = true;
let result = null;

function checkValid(str) {
    // regrex for full link : https://www.youtube.com/watch?v={id}
    let patt = /https:\/\/www\.youtube\.com\/watch\?v=(.{11})/i;

    // regrex for link share in mobile : https://youtu.be/{id}
    let pattmobile = /https:\/\/youtu\.be\/(.{11})/i;
    let result = str.match(patt);
    let result_mobile = str.match(pattmobile);
    if(result){
        process(result);
    }
    else if(result_mobile){
        process(result_mobile);
    }
    else return false;
}

function process(result){
    info_video.style.display = 'none';
    error_info.style.display = 'none';
    loading.style.display = 'flex';
    if(result[1] !== id){
        id = result[1];
        clickedAudio = false;
        clickedVideo = false;
    }
    url = result[0];
    getVideo(result);   
}

function getVideo(link){
    let endpoint = '/getinfo';
    let data = {
        "url": link
    };
    let otherPram = {
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    }
    fetch(endpoint, otherPram)
    .then(data => {return data.json();})
    .then(res => {loadData(res)})
}

function loadData(res){
    if('err' in res){
        errInfo();
        return;
    }
    result = res;
    video_image.src = res['thumbnail'];
    title = res['title'];
    video_title.innerText = res['title'].slice(0,55)+'...';
    video_channel.innerText = res['uploader']
    loading.style.display = 'none';
    info_video.style.display = 'flex';
}

function errInfo(){
    loading.style.display = 'none'
    error_info.style.display = 'flex';
}

function downloadAudio(songid){
    spinner_audio.style.display = 'none';
    text_dl_audio.style.display = 'block';
    createDownload(id+'-'+songid, 'mp3');
}

function converAudio(){
    text_dl_audio.style.display = 'none';
    spinner_audio.style.display = 'block';
    let endpoint = '/convert_audio';
    let data = {
        "id": id,
        "url": url,
        "title": title
    };
    let otherPram = {
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    }
    fetch(endpoint, otherPram).then((response) => {
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(({ done, value }) => {
                // Is there no more data to read?
                if (done) {
                  // Tell the browser that we have finished sending data
                  controller.close();
                  return;
                }
                let str = "";
                for (let i=0; i<value.byteLength; i++) {
                    str += String.fromCharCode(value[i]);
                }
                let message = JSON.parse(str);
                  if(message.hasOwnProperty('songid')){
                      downloadAudio(message['songid']);
                  }

                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                push();
              });
            };
            
            push();
          }
        });

          return new Response(stream, { headers: { "Content-Type": "application/json" } });
    });
}


function convertVideo(){
    text_dl_video.style.display = 'none';
    spinner_video.style.display = 'block';
    let endpoint = '/convert_video';
    let data = {
        "id": id,
        "url": url,
        "title": title,
    };
    let otherPram = {
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    }
    fetch(endpoint, otherPram).then((response) => {
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(({ done, value }) => {
                // Is there no more data to read?
                if (done) {
                  // Tell the browser that we have finished sending data
                  controller.close();
                  return;
                }
                let str = "";
                for (let i=0; i<value.byteLength; i++) {
                    str += String.fromCharCode(value[i]);
                }
                let message = JSON.parse(str);
                  if(message.hasOwnProperty('songid')){
                      downloadVideo(message['songid']);
                  }

                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                push();
              });
            };
            
            push();
          }
        });

          return new Response(stream, { headers: { "Content-Type": "application/json" } });
    });
}

function downloadVideo(songid){
    spinner_video.style.display = 'none';
    text_dl_video.style.display = 'block';
    createDownload(id+'-'+songid, 'mp4');
}

function createDownload(name, ext){
    // let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = window.location.origin+'/download_file/'+name;
    a.download = title+'.'+ext;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

input.addEventListener('input', function(){
    if(checkValid(input.value)) console.log('True');
});

dl_audio.addEventListener('click', function(){
    if(!clickedAudio){
        converAudio();
        clickedAudio = true;
    }
});

dl_video.addEventListener('click', function(){
    if(!clickedVideo){
        convertVideo();
        clickedVideo = true;
    }
});

