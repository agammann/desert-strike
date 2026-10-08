"""Check complete packages and build a fresh byte-exact source consumer."""
import argparse, hashlib, json, os, re, stat, subprocess, zipfile
from pathlib import Path, PurePosixPath

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--out',required=True);p.add_argument('--directory');p.add_argument('--commit')
args=p.parse_args();version=json.loads((ROOT/'package.json').read_text(encoding='utf-8'))['version']
git=lambda *a: subprocess.check_output(['git',*a],cwd=ROOT)
commit=args.commit or git('rev-parse','HEAD').decode().strip()
if not re.fullmatch(r'[0-9a-f]{40}',commit):raise ValueError('Expected exact commit.')
directory=Path(args.directory).resolve() if args.directory else ROOT/'release-artifacts'
archives=['desert-strike_'+version+'_source.zip','desert-strike_'+version+'_offline.zip']
if {f.name for f in directory.iterdir()} != {'SHA256SUMS',*archives,*(n+'.sha256' for n in archives)}:
    raise ValueError('Complete asset set differs.')
lines=[]
for name in archives:
    line=hashlib.sha256((directory/name).read_bytes()).hexdigest()+'  '+name+'\n'
    if (directory/(name+'.sha256')).read_bytes()!=line.encode():raise ValueError('Checksum differs.')
    lines.append(line)
if (directory/'SHA256SUMS').read_bytes()!=''.join(lines).encode():raise ValueError('Combined checksums differ.')
out=Path(args.out).resolve()
if out.exists() or out.is_relative_to(ROOT):raise ValueError('Use a new consumer folder outside the checkout.')
def entries(name,prefix=''):
    files={}
    with zipfile.ZipFile(directory/name) as archive:
        if archive.testzip() is not None or archive.comment.decode()!=commit:raise ValueError('ZIP integrity or commit differs.')
        if len(archive.namelist())!=len(set(archive.namelist())):raise ValueError('Duplicate archive entry.')
        for item in archive.infolist():
            if not item.filename.startswith(prefix):raise ValueError('Prefix differs.')
            path=item.filename[len(prefix):]
            if PurePosixPath(path).is_absolute() or '..' in PurePosixPath(path).parts or '\\' in path or ':' in path:raise ValueError('Unsafe path.')
            if stat.S_IFMT(item.external_attr>>16) not in {0,stat.S_IFREG,stat.S_IFDIR}:raise ValueError('Special file.')
            if not item.is_dir():files[path]=archive.read(item)
    return files
source=entries(archives[0],'desert-strike-'+version+'/')
tracked=git('ls-files','-z').decode().split('\0')[:-1]
if set(source)!=set(tracked):raise ValueError('Source file set differs.')
for name,data in source.items():
    if data!=git('show',commit+':'+name):raise ValueError('Source blob differs: '+name)
    file=out/'source'/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(data)
offline=entries(archives[1])
if set(offline)!={'Desert-Strike.html','Play.cmd','OFFLINE.txt','LICENSE','THIRD_PARTY.md','RELEASE.json'}:raise ValueError('Offline file set differs.')
for name,data in offline.items():
    file=out/'offline'/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(data)
node=os.environ.get('NODE_BINARY','node')
subprocess.run([node,'--test','tests/campaigns.test.cjs','tests/progress.test.cjs'],cwd=out/'source',check=True)
subprocess.run([node,'scripts/build.mjs'],cwd=out/'source',check=True)
html=(out/'source/dist/Desert-Strike.html').read_bytes()
if html!=offline['Desert-Strike.html']:raise ValueError('Fresh build differs from offline delivery.')
for name in ['Play.cmd','OFFLINE.txt','LICENSE','THIRD_PARTY.md']:
    if source[name]!=offline[name]:raise ValueError('Offline documentation differs.')
info=json.loads(offline['RELEASE.json'])
expected={'project':'desert-strike','version':version,'commit':commit,'tree':git('rev-parse',commit+'^{tree}').decode().strip(),
          'htmlSHA256':hashlib.sha256(html).hexdigest(),'sourceFiles':len(source)}
if info!=expected:raise ValueError('Build receipt differs.')
print('Fresh source consumer passed '+str(len(source))+' exact blobs; six offline files match its build and receipt.')
