from pathlib import Path
import hashlib,re,json,collections,subprocess
from html.parser import HTMLParser

root=Path('C:/Users/cotaha/source/repos/-Atomic-UI')
tmp=Path('C:/Users/cotaha/AppData/Local/Temp/codex-atomic-20261026-002')
out=tmp/'juicio'
out.mkdir(exist_ok=True)
log=(tmp/'codificacion-antes.log').read_text(encoding='utf-8')
records=[{'ruta':m[1], 'linea':int(m[2]),'antes':m[3],'despues':m[4]} for m in re.finditer(r"^\s+(CHANGELOG\.md|LESSONS_LEARNED\.md):(\d+)\s+'([^']+)' debe escribirse '([^']+)'\.",log,re.M)]
report={'asignacion':'ATOMIC-20261026-002','metodo':'Comparación independiente con copias previas, posiciones de la salida original, preservación por ordinal y parsing estático de IDs HTML.','hallazgos':len(records),'archivos':{}}

def sha(b):return hashlib.sha256(b).hexdigest()
def dump(name,x):(out/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def code(text):
    blockstart=None;marker=None;regions=[];inlines=[];offset=0
    for line in text.splitlines(keepends=True):
        m=re.match(r'^ {0,3}(`{3,}|~{3,})',line)
        if blockstart is None and m:
            blockstart=offset;marker=m[1]
        elif blockstart is not None:
            if m and m[1][0]==marker[0] and len(m[1])>=len(marker):
                regions.append((blockstart,offset+len(line)));blockstart=None
        else:
            inlines.extend((offset+m.start(),offset+m.end()) for m in re.finditer(r'(`+)(.+?)\1',line))
        offset+=len(line)
    assert blockstart is None
    return regions,inlines

def headings(text):
    blocked=code(text)[0];offset=0;seen={};result=[]
    for no,line in enumerate(text.splitlines(keepends=True),1):
        m=re.match(r'^(#{1,6})\s+(.+?)\s*\n?$',line)
        if m and not any(a<=offset<b for a,b in blocked):
            title=m[2];base=re.sub(r'[^\w\s-]','',title.lower()).replace(' ','-')
            ordinal=seen.get(base,0);seen[base]=ordinal+1
            ident=base+(f'-{ordinal}' if ordinal else '')
            result.append({'linea':no,'nivel':len(m[1]),'texto':title,'id':ident})
        offset+=len(line)
    return result

class HTMLIds(HTMLParser):
    def __init__(self):super().__init__();self.items=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:self.items.append({'etiqueta':tag,'id':d['id'],'linea':self.getpos()[0]})

all_occ=[]
for name in ['CHANGELOG.md','LESSONS_LEARNED.md']:
    before=(tmp/'antes'/name).read_bytes();after=(root/name).read_bytes()
    old=before.decode('utf-8');new=after.decode('utf-8')
    oldlines=old.splitlines(keepends=True);changed=oldlines.copy()
    oldblocks,oldspans=code(old)
    contexts=[]
    for r in [r for r in records if r['ruta']==name]:
        oldline=oldlines[r['linea']-1]
        matches=list(re.finditer(r'(?<!\w)'+re.escape(r['antes'])+r'(?!\w)',oldline))
        assert matches,r
        offset=sum(map(len,oldlines[:r['linea']-1]))
        for m in matches:
            pos=offset+m.start()
            assert not any(a<=pos<b for a,b in oldblocks+oldspans),r
            contexts.append({**r,'columna':m.start()+1,'contexto_original':oldline.rstrip('\r\n'),'clase':'prosa'})
        changed[r['linea']-1]=re.sub(r'(?<!\w)'+re.escape(r['antes'])+r'(?!\w)',r['despues'],changed[r['linea']-1])
    changed_headings=[(n,a,b) for n,(a,b) in enumerate(zip(oldlines,changed),1) if a!=b and re.match(r'^#{1,6} ',a)]
    expected=''.join(changed)
    heading_mapping=[];verificacion_ordinal=0
    for number,a,b in changed_headings:
        if a.strip()=='### Verificacion':
            ident='verificacion'+(f'-{verificacion_ordinal}' if verificacion_ordinal else '')
            verificacion_ordinal+=1
            replacement=f'<h3 id="{ident}">Verificación</h3>\n'
        else:
            ident=next(h['id'] for h in headings(old) if h['linea']==number)
            replacement=f'<a id="{ident}"></a>\n\n'+b
        expected=expected.replace(b,replacement,1)
        heading_mapping.append({'linea_original':number,'id_anterior':ident,'encabezado_original':a.strip(),'marcado_nuevo':replacement.strip()})
    trimmed=re.sub(r'(?ms)^## ATOMIC-20261026-002[^\n]*\n.*?(?=^## ATOMIC-20261026-001)','',new,count=1)
    if name=='LESSONS_LEARNED.md':trimmed=trimmed.replace('last_change_id: "ATOMIC-20261026-002"','last_change_id: "ATOMIC-20261026-001"',1)
    assert expected==trimmed, f'Cambios residuales fuera del alcance: {name}'
    newblocks,newspans=code(new)
    block_old=[old[a:b] for a,b in oldblocks];block_new=[new[a:b] for a,b in newblocks]
    span_old=[old[a:b] for a,b in oldspans];span_new=[new[a:b] for a,b in newspans]
    assert block_old==block_new and span_old==span_new,name
    html=HTMLIds();html.feed(new)
    md_before=headings(old);md_after=headings(new)
    corrected_lines={n for n,a,b in changed_headings}
    before_unchanged=[(h['nivel'],h['texto'],h['id']) for h in md_before if h['linea'] not in corrected_lines]
    corrected_text={b.strip().lstrip('#').strip() for n,a,b in changed_headings if a.strip()!='### Verificacion'}
    after_unchanged=[(h['nivel'],h['texto'],h['id']) for h in md_after if not h['texto'].startswith('ATOMIC-20261026-002') and h['texto'] not in corrected_text]
    assert before_unchanged==after_unchanged, 'Renumeración de encabezados no afectados'
    all_ids=[h['id'] for h in md_after]+[h['id'] for h in html.items]
    assert len(all_ids)==len(set(all_ids)), 'Colisión de IDs'
    for mapping in heading_mapping:
        assert all_ids.count(mapping['id_anterior'])==1
        assert mapping['id_anterior'].isascii()
    vbefore=[h for h in md_before if h['texto']=='Verificación']
    vafter=[h for h in md_after if h['texto']=='Verificación']
    assert [h['id'] for h in vbefore]==[h['id'] for h in vafter]
    # Only original history is compared; notes and aliases are allowed additions.
    dates_before=re.findall(r'(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)',old)
    dates_after=re.findall(r'(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)',trimmed)
    if name=='LESSONS_LEARNED.md':
        # Its added ASCII alias repeats its date, so compare without the added alias.
        dates_after=re.findall(r'(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)',re.sub(r'(?m)^<a id="[^"]+"></a>\n\n','',trimmed))
    semver_pattern=r'(?<!\w)\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?(?!\w)'
    semver_old=re.findall(semver_pattern,old);semver_new=re.findall(semver_pattern,trimmed)
    assert dates_before==dates_after and semver_old==semver_new
    links=lambda t:re.findall(r'\]\(([^\n)]+)\)',t)
    assert links(old)==links(trimmed)
    front=lambda t:re.findall(r'^([A-Za-z_][A-Za-z_0-9]*):',t.split('---',2)[1],re.M)
    assert front(old)==front(new)
    report['archivos'][name]={'sha256_antes':sha(before),'sha256_despues':sha(after),'hallazgos':sum(r['ruta']==name for r in records),'ocurrencias_prosa':len(contexts),'ocurrencias_contractuales':0,'historia_igual_con_correcciones_autorizadas':True,'encabezados_corregidos':heading_mapping,'encabezados_no_afectados':len(before_unchanged),'anclas_Unicode_verificacion_conservadas':len(vbefore),'ids_html':html.items,'ids_sin_colisiones':True,'bloques_codigo':len(block_old),'spans_codigo':len(span_old),'bloques_identicos_por_ordinal':True,'spans_identicos_por_ordinal':True,'fechas_identicas_por_ordinal':True,'semver_identicas_por_ordinal':True,'destinos_enlaces_identicos_por_ordinal':True,'claves_frontmatter_identicas':True,'utf8_sin_bom':not after.startswith(b'\xef\xbb\xbf'),'retornos_carro':after.count(b'\r'),'lf':after.count(b'\n')}
    dump(name+'.contratos-propios.json',{'bloques_sha256_por_ordinal':[sha(x.encode()) for x in block_old],'spans_sha256_por_ordinal':[sha(x.encode()) for x in span_old],'fechas':dates_before,'semver':semver_old,'destinos_enlaces':links(old),'claves_frontmatter':front(old)})
    all_occ.extend(contexts)

for name,heading,replace_old,replace_new in [
('DESVIACION-20260929-005.md','## Precisión de referencia — 2026-10-26','apartado_roto: "§3.1"','apartado_roto: "por-clasificar"'),
('DESVIACION-20261024-011.md','## Resolución documental — 2026-10-26','estado: abierta','estado: corregida')]:
    rel='.agents/desviaciones/'+name
    before=(tmp/'antes'/rel).read_bytes();after=(root/rel).read_bytes()
    old=before.decode('utf-8').replace('\r\n','\n');new=after.decode('utf-8')
    historical,note=new.split('\n'+heading,1)
    expected=old.replace(replace_old,replace_new,1)
    assert historical==expected,name
    oldblocks,oldspans=code(old);newblocks,newspans=code(historical)
    assert [old[a:b] for a,b in oldblocks]==[historical[a:b] for a,b in newblocks]
    assert [old[a:b] for a,b in oldspans]==[historical[a:b] for a,b in newspans]
    material=Path('C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md')
    mattext=material.read_text(encoding='utf-8')
    assert 'version: "2.5.0"' in mattext and '### 3.1 Promoción visual no destructiva (Atomic-first)' in mattext
    assert material.as_posix() in note
    report['archivos'][rel]={'sha256_antes':sha(before),'sha256_despues':sha(after),'historia_integra_salvo_campo_autorizado_y_CRLF':True,'campo_antes':replace_old,'campo_despues':replace_new,'bloques_codigo_anteriores_identicos':len(oldblocks),'spans_codigo_anteriores_identicos':len(oldspans),'referencia_material_verificada':str(material),'version_material':'2.5.0','apartado_material':'3.1','metadatos_adicionales':False,'utf8_sin_bom':not after.startswith(b'\xef\xbb\xbf'),'retornos_carro_antes':before.count(b'\r'),'retornos_carro_despues':after.count(b'\r'),'lf_despues':after.count(b'\n')}

r=subprocess.run(['git','-C',str(root),'diff','--check','--','CHANGELOG.md','LESSONS_LEARNED.md','.agents/desviaciones/DESVIACION-20260929-005.md','.agents/desviaciones/DESVIACION-20261024-011.md'],capture_output=True,text=True,encoding='utf-8')
report['diff_check']={'codigo':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
assert r.returncode==0
report['ocurrencias_prosa']=len(all_occ)
report['contratos_modificados']=0
report['doble_ocurrencia']=[{'ruta':x['ruta'],'linea':x['linea'],'columna':x['columna']} for x in all_occ if x['ruta']=='LESSONS_LEARNED.md' and x['linea']==920 and x['antes']=='tambien']
assert len(all_occ)==151 and len(report['doble_ocurrencia'])==2
dump('matriz-propia-151.json',all_occ)
dump('comparacion-propia.json',report)
print(json.dumps({'hallazgos':len(records),'ocurrencias_prosa':len(all_occ),'contratos_modificados':0,'archivos':len(report['archivos']),'anclas_repetidas_inalteradas':report['archivos']['CHANGELOG.md']['anclas_Unicode_verificacion_conservadas'],'diff_check':r.returncode,'resultado':'comprobado'},ensure_ascii=False))