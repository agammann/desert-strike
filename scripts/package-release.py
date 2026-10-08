"""Build versioned offline and exact committed source packages."""
import hashlib, json, os, re, subprocess, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
git = lambda *args: subprocess.check_output(['git', *args], cwd=ROOT)
if Path.cwd().resolve() != ROOT or git('status','--porcelain','--untracked-files=normal').strip():
    raise ValueError('Package from the root of a clean committed checkout.')
metadata = json.loads((ROOT/'package.json').read_text(encoding='utf-8'))
version = metadata['version']
if metadata['name'] != 'desert-strike' or not re.fullmatch(r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)',version):
    raise ValueError('Expected a stable Desert Strike source version.')
commit = git('rev-parse','HEAD').decode().strip()
if os.environ.get('GITHUB_SHA',commit) != commit:
    raise ValueError('Checkout differs from the workflow commit.')
tree = git('rev-parse','HEAD^{tree}').decode().strip()
tracked = git('ls-files','-z').decode().split('\0')[:-1]
for name in tracked:
    file = ROOT/name
    if not file.is_file() or file.is_symlink() or any(p in {'.git','dist','node_modules','release-artifacts','verification-artifacts'} or p.startswith('.env') for p in Path(name).parts):
        raise ValueError('Private, linked, missing or generated source file.')
    data = file.read_bytes()
    if re.search(rb'sk-(?:proj-)?[A-Za-z0-9_-]{20,}',data) or (b'-----BEGIN'+b' PRIVATE KEY-----') in data:
        raise ValueError('Secret pattern is tracked.')
    if data != git('show','HEAD:'+name):
        raise ValueError('Working bytes differ from committed source: '+name)
subprocess.run([os.environ.get('NODE_BINARY','node'),'scripts/build.mjs'],cwd=ROOT,check=True)
html = (ROOT/'dist/Desert-Strike.html').read_bytes()
if (ROOT/'dist/index.html').read_bytes() != html or ('v'+version).encode() not in html:
    raise ValueError('Browser and offline game versions differ.')
out = ROOT/'release-artifacts'
out.mkdir(exist_ok=True)
source_name = 'desert-strike_'+version+'_source.zip'
subprocess.run(['git','-c','core.autocrlf=false','archive','--format=zip','--prefix=desert-strike-'+version+'/',
                '--output='+str(out/source_name),'HEAD'],cwd=ROOT,check=True)
info = {'project':'desert-strike','version':version,'commit':commit,'tree':tree,
        'htmlSHA256':hashlib.sha256(html).hexdigest(),'sourceFiles':len(tracked)}
members = {'Desert-Strike.html':html}
for name in ['Play.cmd','OFFLINE.txt','LICENSE','THIRD_PARTY.md']:
    members[name]=(ROOT/name).read_bytes()
members['RELEASE.json']=(json.dumps(info,indent=2)+'\n').encode()
offline_name = 'desert-strike_'+version+'_offline.zip'
with zipfile.ZipFile(out/offline_name,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    archive.comment=commit.encode()
    for name,data in members.items():
        item=zipfile.ZipInfo(name,(2000,1,1,0,0,0));item.compress_type=zipfile.ZIP_DEFLATED;item.external_attr=0o100644<<16
        archive.writestr(item,data)
lines=[]
for name in [source_name,offline_name]:
    line=hashlib.sha256((out/name).read_bytes()).hexdigest()+'  '+name+'\n'
    (out/(name+'.sha256')).write_bytes(line.encode());lines.append(line)
(out/'SHA256SUMS').write_bytes(''.join(lines).encode())
print('Packaged '+str(len(tracked))+' exact source files and six offline files from '+commit)
