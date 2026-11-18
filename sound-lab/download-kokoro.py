"""Download free local pilot assets from the runtime project's documented release."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlretrieve

root = Path(__file__).resolve().parents[1] / '.local-tools' / 'kokoro'
root.mkdir(parents=True, exist_ok=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/'
def download(name):
    path = root / name
    if not path.exists():
        urlretrieve(base + name, path)
    print(name, path.stat().st_size, 'bytes', flush=True)
with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(download, ['kokoro-v1.0.onnx', 'voices-v1.0.bin']))
