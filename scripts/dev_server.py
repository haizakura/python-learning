"""本地开发服务器：等同于 python3 -m http.server，但禁止浏览器缓存，改完代码刷新就能看到效果。

用法：python3 scripts/dev_server.py [端口，默认 8000]
"""
import functools
import http.server
import pathlib
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
public = pathlib.Path(__file__).resolve().parent.parent / "public"
handler = functools.partial(NoCacheHandler, directory=str(public))
print(f"http://localhost:{port}")
http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
