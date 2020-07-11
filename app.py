import os
from flask import Flask, request, render_template, send_file
from downloader import Downloader
from randomid import get_random_string


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/download', methods=['POST'])
def download():
    data = request.json
    Downloader(data['url'], data['yt_opts']).download()


@app.route('/download_audio', methods=['POST'])
def download_audio():
    data = request.get_json()
    sid = get_random_string(6)
    filename = './DownloadFiles/' + f'{data["id"]}_{sid}.mp3'
    Downloader(data['url'], sid).downloadAudio()
    rv = send_file(filename, as_attachment=True)
    os.remove(filename)
    return rv


@app.route('/getinfo', methods=['POST'])
def getinfo():
    data = request.get_json()
    res = Downloader(data['url'][0]).extractInfo()
    return res


if __name__ == '__main__':
    app.run()
