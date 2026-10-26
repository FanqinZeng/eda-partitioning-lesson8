"""Faithful PDF preview from Artifact Tool PNGs; editable source remains PPTX.

The local direct PDF exporter lacks a font module and the sandboxed LibreOffice
renderer lacks CJK fonts. Use the visually verified first-party PNG rendering.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'materials/Lesson8-slides.pdf'
images=sorted((ROOT/'build/materials/slides').glob('slide-*.png'))
if len(images)!=16: raise RuntimeError('Expected exactly 16 rendered slides')
staged=ROOT/'build/materials/slide-preview.pdf'
c=canvas.Canvas(str(staged),pagesize=(960,540))
c.setTitle('Lesson 8 多路划分课件预览'); c.setAuthor('FanQin Zeng')
for image in images:
    c.drawImage(str(image),0,0,width=960,height=540)
    c.showPage()
c.save(); staged.replace(out)
print(f'PDF preview from verified rendered slides: {out}')
