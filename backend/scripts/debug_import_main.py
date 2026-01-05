import traceback
import sys
from pathlib import Path

# Ensure project `backend` folder is on sys.path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    import main
    print('main imported successfully')
except Exception:
    traceback.print_exc()
    print('IMPORT_FAILED')
