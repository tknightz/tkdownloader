import youtube_dl
import argparse


class Downloader:
    def __init__(self, url):
        self.url = url
        self.filename = ''
        self.yt_opts = {}
        self.yt_opts['outtmpl'] = './DownloadFiles/%(id)s.%(ext)s'
        self.info = None

    def downloadVideo(self):
        self.yt_opts['format'] = '137'
        with youtube_dl.YoutubeDL(self.yt_opts) as ydl:
            ydl.download([self.url])

    def downloadAudio(self):
        self.yt_opts['format'] = 'bestaudio'
        self.yt_opts['postprocessors'] = [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192'
            }]
        with youtube_dl.YoutubeDL(self.yt_opts) as ydl:
            ydl.download([self.url])

    def extractInfo(self):
        with youtube_dl.YoutubeDL() as ydl:
            try:
                self.info = ydl.extract_info(self.url, download=False)
                self.filename = self.info['title']
                return self.info
            except:
                return {'err': 'Not found!'}

    def download(self):
        with youtube_dl.YoutubeDL(self.yt_opts) as ydl:
            ydl.download([self.url])


if __name__ == '__main__':
    parse = argparse.ArgumentParser()
    parse.add_argument('-a', '--audio', action='store_true')
    parse.add_argument('-i', '--input', action='store', type=str)
    args = parse.parse_args()
    url = args.input
    audio = args.audio
    downloader = Downloader(url)

    if audio:
        downloader.downloadAudio()
    else:
        downloader.downloadVideo()
