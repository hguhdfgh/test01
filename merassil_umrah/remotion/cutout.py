"""Remove the background of the intro (0-10.2s) of public/raw.mp4 -> public/intro_cut.webm (VP9 + alpha)."""
import subprocess, tempfile, pathlib, sys
from rembg import new_session, remove
from PIL import Image

root = pathlib.Path(__file__).parent / 'public'
end = sys.argv[1] if len(sys.argv) > 1 else '10.2'
tmp = pathlib.Path(tempfile.mkdtemp())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', root / 'raw.mp4', '-t', end, '-vf',
                'fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920', tmp / 'f%04d.png'], check=True)
sess = new_session('u2net_human_seg')
frames = sorted(tmp.glob('f*.png'))
for i, f in enumerate(frames):
    out = remove(Image.open(f), session=sess, post_process_mask=True)
    out.save(tmp / f.name.replace('f', 'c'))
    if i % 30 == 0:
        print(f'{i}/{len(frames)}', flush=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', tmp / 'c%04d.png', '-c:v', 'libvpx-vp9',
                '-pix_fmt', 'yuva420p', '-b:v', '6M', '-auto-alt-ref', '0', root / 'intro_cut.webm'], check=True)
print('done')
