from pathlib import Path, PurePosixPath, PureWindowsPath
import json, hashlib, zipfile, stat, re, unicodedata, collections
import fitz

ROOT = Path(r'E:/CRM Final Quisqueya Home noviembre')
BASE = ROOT/'00-fuentes-drive/2026-11-06'
ORIGINAL = BASE/'originales'
EXTRACT = BASE/'extraido-zip'
TEXT = BASE/'texto-pdf'
OUT = ROOT/'06-analisis-documental'
sha = lambda b: hashlib.sha256(b).hexdigest()
manifest = json.loads((BASE/'inventario-drive.json').read_text(encoding='utf-8-sig'))
result = {'date':'2026-11-06','producer':'codex-source-control','scope':'D22 integrity, PDF all-page extraction, ZIP inventory; no complete semantic MD review','drive_manifest_sha256':sha((BASE/'inventario-drive.json').read_bytes()),'originals':[],'zip':{},'pdfs':[]}
for f in manifest['files']:
    p = ORIGINAL/f['relative_folder']/f['title']
    b = p.read_bytes()
    result['originals'].append({'path':p.relative_to(ROOT).as_posix(),'drive_id':f['id'],'drive_url':f['url'],'expected_bytes':int(f['size']),'actual_bytes':len(b),'size_match':len(b)==int(f['size']),'sha256':sha(b),'remote_hash_available':False})
expected = {x['path'] for x in result['originals']}
result['unexpected_originals']=[p.relative_to(ROOT).as_posix() for p in ORIGINAL.rglob('*') if p.is_file() and p.relative_to(ROOT).as_posix() not in expected]
EXTRACT.mkdir(exist_ok=True)
TEXT.mkdir(exist_ok=True)
zpath=next(ORIGINAL.glob('*.zip'))
with zipfile.ZipFile(zpath) as z:
    entries=z.infolist()
    assert len(entries)<1000 and sum(x.file_size for x in entries)<100_000_000
    targets=[]
    for item in entries:
        name=item.filename.replace('\\','/')
        pp=PurePosixPath(name)
        if pp.is_absolute() or PureWindowsPath(name).drive or '..' in pp.parts or ':' in name or stat.S_ISLNK(item.external_attr>>16):
            raise ValueError('Unsafe ZIP member '+item.filename)
        dest=(EXTRACT/name).resolve()
        if not dest.is_relative_to(EXTRACT.resolve()): raise ValueError('Traversal')
        if name in targets: raise ValueError('Duplicate member')
        targets.append(name)
    assert z.testzip() is None
    zip_rows=[]
    for item in entries:
        dest=EXTRACT/item.filename
        if item.is_dir(): dest.mkdir(parents=True,exist_ok=True); continue
        b=z.read(item)
        dest.parent.mkdir(parents=True,exist_ok=True)
        if dest.exists() and dest.read_bytes()!=b: raise ValueError('Refusing overwrite different extracted file')
        if not dest.exists(): dest.write_bytes(b)
        same_name=list(ORIGINAL.rglob(dest.name))
        matches=[p.relative_to(ROOT).as_posix() for p in same_name if sha(p.read_bytes())==sha(b)]
        zip_rows.append({'name':item.filename,'bytes':len(b),'sha256':sha(b),'byte_identical_originals':matches,'adds_to_downloads':not bool(matches)})
    result['zip']={'path':zpath.relative_to(ROOT).as_posix(),'entries':zip_rows,'total_entries':len(entries),'total_uncompressed_bytes':sum(x.file_size for x in entries),'safety':'all members checked before extraction: no absolute/drive/traversal/symlink/duplicate destinations; bounded total; CRC testzip passed','executed_members':False}
build_manifest=json.loads((EXTRACT/'manifest.json').read_text(encoding='utf-8-sig'))
bm={Path(x['pdf']).name:x for x in build_manifest}

def words(s):
    s=unicodedata.normalize('NFKC',s).lower().replace('\u00ad','')
    return re.findall(r'[^\W_]+',s,re.UNICODE)

for p in sorted(ORIGINAL.rglob('*.pdf')):
    doc=fitz.open(p)
    pages=[]
    alltext=[]
    for n,page in enumerate(doc):
        t=page.get_text('text',sort=True)
        pages.append({'page':n+1,'chars':len(t),'words':len(words(t)),'text_sha256':sha(t.encode()),'image_count':len(page.get_images())})
        alltext.append(t)
    txt='\n'.join(f'=== PAGE {n+1}/{len(pages)} ===\n{t}' for n,t in enumerate(alltext))
    tp=TEXT/(p.stem+'.txt')
    tp.write_text(txt,encoding='utf-8')
    md=p.with_suffix('.md')
    data={'pdf':p.relative_to(ROOT).as_posix(),'pdf_sha256':sha(p.read_bytes()),'pages':pages,'page_count':len(pages),'all_pages_extracted':True,'text_output':tp.relative_to(ROOT).as_posix(),'text_sha256':sha(tp.read_bytes()),'text_chars':len(txt),'empty_text_pages':[x['page'] for x in pages if x['chars']<10],'markdown':md.relative_to(ROOT).as_posix() if md.exists() else None}
    if md.exists():
        mb=md.read_bytes(); ms=mb.decode('utf-8-sig'); ps='\n'.join(alltext)
        mw,pw=collections.Counter(words(ms)),collections.Counter(words(ps))
        missing=mw-pw
        data.update({'markdown_sha256':sha(mb),'markdown_words':sum(mw.values()),'pdf_words':sum(pw.values()),'markdown_token_coverage_in_pdf':round(sum((mw&pw).values())/max(1,sum(mw.values())),4),'missing_token_counts':dict(missing.most_common()),'pdf_unique_extra_token_counts':dict((pw-mw).most_common(50))})
        expected_build=bm.get(p.name)
        if expected_build:
            data['build_manifest']={'source_sha256_match':sha(mb)==expected_build['sha256'],'expected_source_sha256':expected_build['sha256'],'page_count_match':len(doc)==expected_build['pages'],'pdf_bytes_match':p.stat().st_size==expected_build['bytes'],'source_declared':expected_build['source']}
        # Explicit reference IDs help catch omitted requirements independently of markdown punctuation.
        marker=re.compile(r'\b(?:RF|RNF|REQ|CA|Q|P0|DEC|ADR|M|G|H|CI)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b',re.I)
        mm=set(marker.findall(ms)); pm=set(marker.findall(ps))
        data['reference_ids_only_in_markdown']=sorted(mm-pm)
    result['pdfs'].append(data)
    doc.close()

hash_groups=collections.defaultdict(list)
for x in result['originals']: hash_groups[x['sha256']].append(x['path'])
result['duplicate_original_groups']=[x for x in hash_groups.values() if len(x)>1]
result['summary']={'original_count':len(result['originals']),'size_matches':sum(x['size_match'] for x in result['originals']),'pdf_count':len(result['pdfs']),'pdf_pages':sum(x['page_count'] for x in result['pdfs']),'paired_markdown':sum(bool(x['markdown']) for x in result['pdfs']),'build_source_hash_matches':sum(x.get('build_manifest',{}).get('source_sha256_match',False) for x in result['pdfs']),'empty_text_pages':sum(len(x['empty_text_pages']) for x in result['pdfs']),'zip_identical_to_originals':sum(bool(x['byte_identical_originals']) for x in result['zip']['entries']),'zip_additional_files':[x['name'] for x in result['zip']['entries'] if x['adds_to_downloads']]}
(OUT/'control-fuentes.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result['summary'],ensure_ascii=False,indent=2))
for d in result['pdfs']:
 print(d['pdf'].split('/')[-1],d['page_count'],d.get('markdown_token_coverage_in_pdf'),d.get('build_manifest'),list(d.get('missing_token_counts',{}).items())[:15],d.get('reference_ids_only_in_markdown'))
