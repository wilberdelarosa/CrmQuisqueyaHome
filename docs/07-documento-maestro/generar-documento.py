"""Reproduce índices, catálogos y documento web desde análisis locales. No toca originales."""
from pathlib import Path
import csv
import hashlib
import html
import json
import re
import markdown

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '00-fuentes-drive/2026-11-06/originales'
OUT = ROOT / '07-documento-maestro'
ANALYSIS = ROOT / '06-analisis-documental'
MASTER = OUT / 'CRM-QH-DOCUMENTO-FINAL-2026-11-06.md'
GOV = {
    'LEEME.md': 'LEEME', '00-Indice.md': 'INDICE',
    'VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.md': 'ADR',
    'VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06.md': 'CIERRE',
    'VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06.md': 'P0',
    'VT-CRM-INV-Modulos_v0.2_2026-11-06.md': 'INVENTARIO',
    'VT-CRM-PLN-Recoleccion-especificaciones_v0.2_2026-11-06.md': 'PLAN',
    'VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md': 'PLANTILLA',
}
coverage = []
ucs = []
for source in sorted(SRC.rglob('*.md')):
    match = re.match(r'VT-CRM-ESP-([^_]+)_', source.name)
    code = match.group(1) if match else GOV[source.name]
    note = ANALYSIS / 'individuales' / (code + '.md')
    if not note.is_file():
        raise RuntimeError('Falta análisis: ' + code)
    source_text = source.read_text(encoding='utf-8-sig')
    coverage.append({
        'code': code, 'source': str(source.relative_to(ROOT)).replace('\\', '/'),
        'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'analysis': str(note.relative_to(ROOT)).replace('\\', '/'),
        'source_lines': len(source_text.splitlines()),
        'pdf': str(source.with_suffix('.pdf').relative_to(ROOT)).replace('\\', '/') if source.with_suffix('.pdf').is_file() else None,
    })
    if match:
        in_usecases = False
        for line_no, line in enumerate(source_text.splitlines(), 1):
            if re.match(r'^##\s+2[.\s]', line):
                in_usecases = True
            elif re.match(r'^##\s+3[.\s]', line):
                in_usecases = False
            if in_usecases and re.match(r'^\|\s*UC-', line):
                cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
                ucs.append({'module': code, 'case_id': cells[0], 'description': cells[1] if len(cells) > 1 else '',
                            'source': str(source.relative_to(ROOT)).replace('\\', '/'), 'line': line_no, 'source_row': line})
if len(coverage) != 30 or len({x['code'] for x in coverage}) != 30:
    raise RuntimeError('Cobertura distinta de 30 fuentes textuales únicas')
(ANALYSIS / 'cobertura-documental.json').write_text(json.dumps(coverage, ensure_ascii=False, indent=2), encoding='utf-8')
with (OUT / 'catalogo-casos-de-uso.csv').open('w', encoding='utf-8-sig', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['module', 'case_id', 'description', 'source', 'line', 'source_row'])
    writer.writeheader()
    writer.writerows(ucs)
index = '# Análisis documental uno por uno\n\n2026-11-06. 30 fuentes textuales únicas, con sus 26 presentaciones PDF contrastadas en control-fuentes.md. Lectura semántica delegada por documento; no prueba de implementación.\n\n| Código | Original preservado | Nota individual | PDF |\n|---|---|---|---|\n'
for item in coverage:
    original = Path(item['source']).name
    index += f"| {item['code']} | [{original}](../{item['source']}) | [{item['code']}](individuales/{item['code']}.md) | {'Pareado/verificado' if item['pdf'] else 'Sin PDF en este lote'} |\n"
index += '\n[Control de fuentes](control-fuentes.md) · [Documento final](../07-documento-maestro/CRM-QH-DOCUMENTO-FINAL-2026-11-06.html) · [Diagramas interactivos](../08-diagramas-interactivos/index.html).\n'
(ANALYSIS / 'README.md').write_text(index, encoding='utf-8')
main = MASTER.read_text(encoding='utf-8').split('<!-- ANEXOS-ANALISIS -->')[0].rstrip()
communications = []
for line in main.splitlines():
    if re.match(r'^\| C-\d+', line):
        cells = [x.strip() for x in line.strip('|').split('|')]
        communications.append(dict(zip(['id', 'direction', 'payload', 'controls', 'evidence_status'], cells)))
with (OUT / 'comunicaciones.csv').open('w', encoding='utf-8-sig', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['id', 'direction', 'payload', 'controls', 'evidence_status'])
    writer.writeheader()
    writer.writerows(communications)
detail_edges = []
for group in ['grupo-comercial.json', 'grupo-operaciones.json']:
    group_path = ANALYSIS / group
    if group_path.exists():
        data = json.loads(group_path.read_text(encoding='utf-8-sig'))
        for edge in data['communications']:
            detail_edges.append({
                'id': edge['id'], 'from': edge['from'], 'to': edge['to'],
                'meaning': edge.get('label', edge.get('payload', '')),
                'status': edge['status'], 'group': group,
                'sources': edge.get('sources', [edge.get('source', {})]),
            })
(OUT / 'relaciones-detalladas.json').write_text(json.dumps({'note': 'Relaciones extraídas con fuente/estado; no equivalen a APIs o conexiones implementadas independientes.', 'edges': detail_edges}, ensure_ascii=False, indent=2), encoding='utf-8')
with (OUT / 'relaciones-detalladas.csv').open('w', encoding='utf-8-sig', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['id', 'from', 'to', 'meaning', 'status', 'group', 'sources'])
    writer.writeheader()
    writer.writerows({**edge, 'sources': json.dumps(edge['sources'], ensure_ascii=False)} for edge in detail_edges)
annex = '\n\n<!-- ANEXOS-ANALISIS -->\n\n# Anexos — lectura individual de los 30 documentos\n\nLos textos siguientes son análisis producidos en esta ronda, no copias de los originales. Las referencias F:L remiten al archivo fuente identificado al principio de cada nota. Los hashes y la cobertura están en cobertura-documental.json.\n'
annex_html = []
for i, item in enumerate(coverage, 1):
    note_text = (ROOT / item['analysis']).read_text(encoding='utf-8-sig')
    title = note_text.splitlines()[0].lstrip('# ')
    content = '\n'.join(note_text.splitlines()[1:])
    annex += f'\n\n## Anexo {i:02d} · {title}\n\n' + re.sub(r'^## ', '### ', content, flags=re.M).strip() + '\n'
    rendered = markdown.markdown(content, extensions=['tables', 'fenced_code'])
    annex_html.append(f'<details id="anexo-{item["code"].lower()}"><summary>{html.escape(title)}</summary>{rendered}</details>')
MASTER.write_text(main + annex, encoding='utf-8')
engine = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'], extension_configs={'toc': {'toc_depth': '2'}})
rendered_main = engine.convert(main)
page = '''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CRM Quisqueya Home · Documento consolidado</title><style>
:root{color-scheme:light;--ink:#1e293b;--muted:#526174;--line:#d9e0e8;--accent:#235b55;--paper:#fff;--bg:#f3f5f7}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,sans-serif}a{color:var(--accent);text-underline-offset:3px}nav{position:fixed;inset:0 auto 0 0;width:285px;overflow:auto;padding:28px 22px;background:var(--paper);border-right:1px solid var(--line);font-size:13px}nav ul{padding-left:18px}nav li{margin:8px 0}main{max-width:1280px;margin:0 auto 0 285px;padding:50px 5vw 80px;background:var(--paper)}h1{font-size:2.2rem;line-height:1.2;letter-spacing:-.025em}h2{margin-top:3.2rem;line-height:1.3;border-top:1px solid var(--line);padding-top:1.4rem}h3{margin-top:2rem;line-height:1.4}p,li{max-width:90ch}table{border-collapse:collapse;width:100%;display:block;overflow:auto;margin:24px 0;font-size:14px}th,td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;min-width:115px}th{background:var(--bg)}pre{overflow:auto;padding:20px;background:var(--bg);font-size:13px}code{font-size:.88em;overflow-wrap:anywhere}details{padding:16px 0;border-bottom:1px solid var(--line)}summary{cursor:pointer;font-weight:650;color:var(--accent)}:focus-visible{outline:3px solid #c47e16;outline-offset:4px}.toplinks{font-size:14px;padding-bottom:18px;border-bottom:1px solid var(--line)}.status{color:var(--muted);font-size:14px} @media(max-width:1000px){nav{position:static;width:auto;max-height:35vh}main{margin:0;padding:28px 20px}h1{font-size:1.9rem}}@media print{nav,.toplinks{display:none}main{margin:0;padding:0;max-width:none}body{background:white}h2{break-before:auto}tr{break-inside:avoid}details{display:block}details>*{display:block}a{color:inherit}}
</style></head><body><nav><strong>Quisqueya Home</strong><p class="status">Documento consolidado · 06/11/2026</p>TOC<div><a href="#anexos">30 análisis individuales</a></div></nav><main><div class="toplinks"><a href="../08-diagramas-interactivos/index.html">Abrir diagramas interactivos</a> · <a href="../06-analisis-documental/README.md">Índice de fuentes</a> · <a href="CRM-QH-DOCUMENTO-FINAL-2026-11-06.md">Fuente Markdown completa</a></div>BODY<h2 id="anexos">Anexos: 30 documentos analizados</h2><p class="status">Despliega cada nota para ver reglas, conexiones, estados y localizadores. La revisión de estas fuentes no acredita el runtime.</p>ANNEX</main></body></html>'''
page = page.replace('TOC', engine.toc).replace('BODY', rendered_main).replace('ANNEX', '\n'.join(annex_html))
(OUT / 'CRM-QH-DOCUMENTO-FINAL-2026-11-06.html').write_text(page, encoding='utf-8')
print(json.dumps({'sources': len(coverage), 'pdf_pairs': sum(bool(x['pdf']) for x in coverage), 'usecase_rows': len(ucs), 'communications': len(communications), 'detailed_relations': len(detail_edges), 'annexes': len(annex_html)}, ensure_ascii=False))
