import os
from flask import Flask, request, render_template, send_file, Response, make_response
from downloader import Downloader
from threading import Thread
from randomid import get_random_string
from glob import glob
import time


def convert(data, songid, audio=True):
    if audio:
        Downloader(data['url'], songid=songid).downloadAudio()
    else:
        Downloader(data['url'], songid=songid).downloadVideo()


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/get_download_video', methods=['POST'])
def get_download_video():
    songid = get_random_string(6)
    try:
        Downloader(request.args.get('url'), songid=songid).downloadVideo()
        return f'http://tkdownloader.herokuapp.com/download_file/{request.args.get("id")}-{songid}'
    except:
        return 'Cannot download file. Maybe your link was broken.'


@app.route('/get_download_audio', methods=['POST'])
def get_download_audio():
    songid = get_random_string(6)
    try:
        Downloader(request.args.get('url'), songid=songid).downloadAudio()
        return f'http://tkdownloader.herokuapp.com/download_file/{request.args.get("id")}-{songid}'
    except:
        return 'Cannot download file. Maybe your link was broken!'


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


@app.route('/download_file/<name>', methods=['GET'])
def download_file(name):
    filename = glob(f'./DownloadFiles/{name}*')[0]
    temp = os.path.basename(filename).split('-')
    name = ''
    for i in range(2, len(temp)):
        name.join(temp[i])

    response = make_response(send_file(filename, as_attachment=True))
    response.headers['Content-disposition'] = f'filename={name}'
    os.remove(filename)
    return response


@app.route('/convert_video', methods=['POST'])
def convert_video():
    data = request.get_json()
    songid = get_random_string(6)
    thread1 = Thread(target=convert, args=(data, songid, False,))
    thread1.start()

    def generate():
        while thread1.is_alive():
            yield '{"Converting": true}'
            time.sleep(1)

        yield '{"songid":' + f'"{songid}"' + '}'

    return Response(generate(), mimetype='application/json')


@app.route('/getinfo', methods=['POST'])
def getinfo():
    data = request.get_json()
    res = Downloader(data['url'][0]).extractInfo()
    return res


if __name__ == '__main__':
    app.run()
