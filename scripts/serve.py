"""Serve the course on localhost, with MP4 byte-range support."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse,re
class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path=Path(self.translate_path(self.path))
        if not path.is_file():return super().send_head()
        length=path.stat().st_size;match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
        if not match:return super().send_head()
        start=int(match[1]);end=min(int(match[2]) if match[2] else length-1,length-1)
        if start>end or start>=length:self.send_error(416);return None
        f=path.open('rb');f.seek(start);self.send_response(206);self.send_header('Content-Type',self.guess_type(str(path)));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{length}');self.send_header('Content-Length',str(end-start+1));self.end_headers();self.remaining=end-start+1;return f
    def copyfile(self,source,outputfile):
        try:
            if not hasattr(self,'remaining'):return super().copyfile(source,outputfile)
            while self.remaining:
                block=source.read(min(65536,self.remaining))
                if not block:break
                outputfile.write(block);self.remaining-=len(block)
        except (BrokenPipeError,ConnectionResetError):pass
        finally:
            if hasattr(self,'remaining'):del self.remaining
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8008);p.add_argument('--directory',default=str(Path(__file__).resolve().parents[1]/'docs'));a=p.parse_args()
    from functools import partial
    print(f'Local: http://127.0.0.1:{a.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',a.port),partial(Handler,directory=a.directory)).serve_forever()
