import os
from flask import Flask, request, render_template, send_file, Response
from downloader import Downloader
from threading import Thread
from randomid import get_random_string
import time


def convert(data, songid, audio=True, quality=''):
    if audio:
        Downloader(data['url'], songid=songid).downloadAudio()
    else:
        Downloader(data['url'], songid=songid).downloadVideo(quality)


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/download', methods=['POST'])
def download():
    data = request.json
    Downloader(data['url'], data['yt_opts']).download()


@app.route('/convert_audio', methods=['POST'])
def convert_audio():
    data = request.get_json()
    songid = get_random_string(6)
    thread1 = Thread(target=convert, args=(data, songid,))
    thread1.start()

    def generate():
        percent = 1
        while thread1.is_alive():
            yield '{"Converting":' + str(percent) + '}'
            percent += 3.1415
            time.sleep(2)

        yield '{"songid":' + f'"{songid}"' + '}'

    return Response(generate(), mimetype='application/json')


@app.route('/download_audio', methods=['POST'])
def download_audio():
    data = request.get_json()
    filename = f'./DownloadFiles/{data["id"]}-{data["songid"]}.mp3'
    rv = send_file(filename, as_attachment=True)
    os.remove(filename)
    return rv


@app.route('/convert_video', methods=['POST'])
def convert_video():
    data = request.get_json()
    songid = get_random_string(6)
    quality = data['quality']
    thread1 = Thread(target=convert, args=(data, songid, False, quality))
    thread1.start()

    def generate():
        while thread1.is_alive():
            yield '{"Converting": true}'
            time.sleep(1)

        yield '{"songid":' + f'"{songid}"' + '}'

    return Response(generate(), mimetype='application/json')


@app.route('/download_video', methods=['POST'])
def download_video():
    data = request.get_json()
    filename = f'./DownloadFiles/{data["id"]}-{data["songid"]}.mp4'
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
