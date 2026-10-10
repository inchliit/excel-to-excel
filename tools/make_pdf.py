"""Print the deck to PDF with headless Chrome: python3 tools/make_pdf.py [url] [out.pdf]
Chrome on this Mac writes the PDF but never exits, so we wait for %%EOF and kill its process group."""
import os, signal, subprocess, sys, tempfile, time

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8797/index.html?print-pdf'
out = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else 'excel-to-excel.pdf')
if os.path.exists(out):
    os.remove(out)
profile = tempfile.mkdtemp(prefix='xl-pdf-')
p = subprocess.Popen([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--hide-scrollbars',
                      '--run-all-compositor-stages-before-draw', '--virtual-time-budget=20000',
                      '--user-data-dir=' + profile, '--print-to-pdf=' + out, url],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
t0 = time.time()
done = False
while time.time() - t0 < 120 and not done:
    time.sleep(0.5)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        with open(out, 'rb') as f:
            f.seek(max(0, os.path.getsize(out) - 1024))
            done = b'%%EOF' in f.read()
try:
    os.killpg(p.pid, signal.SIGKILL)
except (ProcessLookupError, PermissionError):
    subprocess.run(['pkill', '-9', '-f', profile])
print('pdf:', out, os.path.getsize(out) if os.path.exists(out) else 'MISSING', 'complete' if done else 'INCOMPLETE')
sys.exit(0 if done else 1)
