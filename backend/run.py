import sys
from pathlib import Path
import uvicorn

# Ensure 'src' directory is in Python path
src_dir = Path(__file__).resolve().parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

if __name__ == "__main__":
    print("🐉 Launching Dracarys Verification Engine on Monad...")
    print("🔥 API Docs available at: http://127.0.0.1:8000/docs")
    uvicorn.run("src.app.main:app", host="0.0.0.0", port=8000, reload=True)
