"""Recorta a persona do fundo e separa o rosto.

Uso (uma vez, quando a foto da persona mudar):
    python scripts/desenhos/recorta-persona.py marca/persona-original.jpg
    npm run desenhos

Gera, em marca/ (pasta que não vai para o site):
    persona-recortada.png  a pessoa sem fundo, para a moldura do topo e o OG
    persona-rosto.png      o rosto em quadrado, para o avatar redondo
O `npm run desenhos` transforma os dois nos WebP de public/brand/.

Funciona com fundo liso e saturado (o amarelo das fotos do canal). Precisa de
Python com opencv-python e numpy.
"""
import os
import sys

import cv2
import numpy as np

origem = sys.argv[1] if len(sys.argv) > 1 else 'marca/persona-original.jpg'
pasta = os.path.dirname(origem) or '.'
img = cv2.imread(origem)
if img is None:
    sys.exit(f'não consegui abrir {origem}')
h, w = img.shape[:2]

# 1. fundo: a cor que domina as bordas da foto, com tolerância
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
borda = np.concatenate([hsv[0, :], hsv[:, 0], hsv[:, -1]])
matiz = int(np.median(borda[:, 0]))
H, S, V = (hsv[..., i].astype(int) for i in range(3))
fundo = ((abs(H - matiz) <= 13) & (S >= 150) & (V >= 110)).astype(np.uint8)

# só o fundo ligado às bordas de cima e dos lados
_, rotulos = cv2.connectedComponents(fundo)
ligados = set(np.unique(np.concatenate([rotulos[0, :], rotulos[:, 0], rotulos[:, -1]]))) - {0}
fundo = np.isin(rotulos, list(ligados)).astype(np.uint8)
fundo = cv2.morphologyEx(fundo, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

# 2. GrabCut a partir dessa máscara refina cabelo e camiseta
mask = np.where(fundo == 1, cv2.GC_PR_BGD, cv2.GC_PR_FGD).astype(np.uint8)
mask[cv2.erode(fundo, np.ones((15, 15), np.uint8)) == 1] = cv2.GC_BGD
mask[cv2.erode(1 - fundo, np.ones((21, 21), np.uint8)) == 1] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
alfa = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# fica só o maior pedaço e fecha buracos pequenos
n, rot, stats, _ = cv2.connectedComponentsWithStats((alfa > 0).astype(np.uint8))
alfa = np.where(rot == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
n, rot, stats, _ = cv2.connectedComponentsWithStats((alfa == 0).astype(np.uint8))
for i in range(1, n):
    x, y, ww, hh, area = stats[i]
    if x > 0 and y > 0 and x + ww < w and area < 4000:
        alfa[rot == i] = 255
alfa = cv2.GaussianBlur(alfa, (5, 5), 1.2)

# 3. tira o reflexo da cor do fundo na borda (só onde é a cor do fundo, não a pele)
anel = cv2.dilate((alfa > 10).astype(np.uint8), np.ones((7, 7), np.uint8)) - cv2.erode(
    (alfa > 245).astype(np.uint8), np.ones((5, 5), np.uint8)
)
hsv2 = hsv.astype(np.float32)
reflexo = (abs(hsv2[..., 0] - matiz) <= 10) & (hsv2[..., 1] > 150) & (anel > 0)
hsv2[..., 1] = np.where(reflexo, hsv2[..., 1] * 0.45, hsv2[..., 1])
hsv2[..., 2] = np.where(reflexo, hsv2[..., 2] * 0.8, hsv2[..., 2])
corrigido = cv2.cvtColor(hsv2.clip(0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)
rgba = cv2.cvtColor(corrigido, cv2.COLOR_BGR2BGRA)
rgba[..., 3] = alfa
cv2.imwrite(os.path.join(pasta, 'persona-recortada.png'), rgba)

# 4. rosto: a cabeça é o topo da silhueta, até onde a largura salta nos
# ombros. Não depende de detector de rosto (o OpenCV 5 tirou o antigo).
cheio = alfa > 128
linhas = np.where(cheio.any(axis=1))[0]
topo = int(linhas[0])
larguras = cheio.sum(axis=1)
largura_cabeca = np.median(larguras[topo + h // 20 : topo + h // 6])
ombro = topo + h // 6
for y in range(topo + h // 6, h):
    if larguras[y] > largura_cabeca * 1.9:
        ombro = y
        break
colunas = np.where(cheio[topo:ombro].any(axis=0))[0]
cx = (colunas[0] + colunas[-1]) / 2 if len(colunas) else w / 2
lado = int(min((ombro - topo) * 1.12, w, h))
x0 = int(min(max(cx - lado / 2, 0), w - lado))
y0 = int(min(max(topo - lado * 0.06, 0), h - lado))
cv2.imwrite(os.path.join(pasta, 'persona-rosto.png'), img[y0 : y0 + lado, x0 : x0 + lado])

print(f'ok: {os.path.join(pasta, "persona-recortada.png")} e persona-rosto.png (cabeça de y={topo} a y={ombro})')
