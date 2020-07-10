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

let id = '';
let url = '';
let title = '';
let clicked = true;

function checkValid(str) {
    let patt = /https:\/\/www\.youtube\.com\/watch\?v=(.{11})/i;
    let result = str.match(patt);
    if(result){
        console.log(result[0]);
        info_video.style.display = 'none';
        error_info.style.display = 'none';
        loading.style.display = 'flex';
        if(result[1] !== id){
            id = result[1];
            clicked = false;
        }
        url = result[0];
        getVideo(result);   
    };
    return false;
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
    .then(err => {console.log(err)})
}

function loadData(res){
    if('err' in res){
        errInfo();
        return;
    }
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

function downloadAudio(){
    text_dl_audio.style.display = 'none';
    spinner_audio.style.display = 'block';
    let endpoint = '/download_audio';
    let data = {
        "id": id,
        "url": url,
        "title": title+'.mp3'
    };
    let otherPram = {
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    }
    fetch(endpoint, otherPram)
    .then(data => {return data.blob()})
        .then(blob => {
            createDownload(blob,'mp3');
        });
}

function createDownload(blob, ext){
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = title+'.'+ext;
    document.body.appendChild(a);
    a.click();
    a.remove();
    spinner_audio.style.display = 'none';
    text_dl_audio.style.display = 'block';
}

input.addEventListener('input', function(){
    if(checkValid(input.value)) console.log('True');
});

dl_audio.addEventListener('click', function(){
    if(!clicked){
        downloadAudio();
        clicked = true;
    }
});

