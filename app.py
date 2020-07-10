import os
from flask import Flask, request, render_template, send_file
from downloader import Downloader
from validfilename import validFilename


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
    Downloader(data['url']).downloadAudio()
    filename = './DownloadFiles/' + validFilename(str(data['title']))
    rv = send_file(filename)
    os.remove(filename)
    return rv


@app.route('/getinfo', methods=['POST'])
def getinfo():
    data = request.get_json()
    res = Downloader(data['url'][0]).extractInfo()
    return res


if __name__ == '__main__':
    app.run()
