"""把 public/favicon.svg 渲染成 PNG 图标。修改 logo 后重新运行一次即可。

需要 macOS（用自带的 sips 缩放）和 Google Chrome（无头模式渲染，可用环境变量 CHROME 指定路径）。
用法：python3 scripts/make_icons.py
输出：public/apple-touch-icon.png（180×180）、public/favicon-32x32.png（32×32）
"""
import os
import pathlib
import subprocess
import tempfile

PUBLIC = pathlib.Path(__file__).resolve().parent.parent / "public"
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
# 和页面左上角的 logo 一样使用 JetBrains Mono（display=block：等字体加载完再渲染）
FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=block">'
MASTER = 512  # 先按大尺寸渲染，再缩小，边缘更平滑


def render(svg, out):
    with tempfile.TemporaryDirectory() as d:
        page = pathlib.Path(d) / "icon.html"
        page.write_text(
            f'<!doctype html><meta charset="utf-8">{FONT}'
            f"<style>html,body{{margin:0;background:transparent}}svg{{display:block;width:{MASTER}px;height:{MASTER}px}}</style>{svg}",
            encoding="utf-8",
        )
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--default-background-color=00000000",
             f"--window-size={MASTER},{MASTER}", "--virtual-time-budget=5000", f"--screenshot={out}", page.as_uri()],
            check=True, capture_output=True,
        )


def resize(src, size, out):
    subprocess.run(["sips", "-z", str(size), str(size), str(src), "--out", str(out)], check=True, capture_output=True)


svg = (PUBLIC / "favicon.svg").read_text(encoding="utf-8")
with tempfile.TemporaryDirectory() as d:
    rounded = pathlib.Path(d) / "rounded.png"
    square = pathlib.Path(d) / "square.png"
    render(svg, rounded)
    # iOS 会自己给主屏幕图标切圆角，透明的角会变成黑色，所以 apple-touch-icon 用不带圆角的满版方形
    render(svg.replace(' clip-path="url(#r)"', ""), square)
    resize(square, 180, PUBLIC / "apple-touch-icon.png")
    resize(rounded, 32, PUBLIC / "favicon-32x32.png")
print("已生成 public/apple-touch-icon.png、public/favicon-32x32.png")
