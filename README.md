# MOTO — kit di animazione tipografica

Editor di motion design nel browser, senza build. Apri `index.html` oppure avvia un server locale dalla cartella del progetto:

```sh
python3 -m http.server 8765
```

Poi visita http://localhost:8765. I font Google e le icone richiedono una connessione; il motore di animazione è locale.

## Timeline multitraccia

- Ogni blocco di testo e livello immagine ha una traccia. Il nome del testo seleziona i controlli nell’ispettore; il nome dell’immagine apre i suoi controlli.
- Trascina una clip di testo per spostarne l’inizio e i keyframe insieme. I bordi regolano ritardo, entrata, pausa, uscita e coda. Le durate sono mostrate nei suggerimenti al passaggio del puntatore.
- Trascina una clip immagine per spostarla; i bordi impostano inizio e fine. Spostando un’immagine con fine automatica, la durata attuale viene mantenuta e la fine diventa esplicita. Le immagini possono estendere la durata del progetto oltre il testo.
- Usa **Aggancia** per allinearti a fasi, clip, keyframe e marker. **Alt** sospende l’aggancio magnetico durante il trascinamento; rimane la precisione al fotogramma.
- Lo zoom va dal 100% al 1600%, con scorrimento orizzontale e nomi delle tracce fissi. **Adatta** ripristina la vista completa.
- **+ Marker** aggiunge un riferimento alla testina. Puoi rinominarlo nella barra sotto la timeline, trascinarlo o eliminarlo. Anche il doppio clic nella riga dei marker ne aggiunge uno.
- Seleziona un keyframe per copiarlo e incollarlo alla testina, anche su un altro testo. Incollare su un keyframe esistente ne aggiorna i valori senza creare duplicati. Le frecce accanto al rombo raggiungono il keyframe precedente o successivo.
- **Intervallo anteprima**, **In** e **Out** delimitano la porzione da riprodurre. Con Loop attivo viene ripetuta; altrimenti la riproduzione si ferma alla fine dell’intervallo. L’esportazione continua a usare l’intero progetto.
- **Esc** annulla un trascinamento. Le modifiche completate supportano annulla/ripeti, salvataggio automatico e preset JSON. I preset precedenti restano compatibili.

## Scorciatoie aggiunte

| Tasto | Azione |
| --- | --- |
| M | Marker alla testina |
| I / O | Inizio / fine intervallo di anteprima |
| [ / ] | Keyframe precedente / successivo |
| ⌘/Ctrl C / V | Copia / incolla keyframe selezionato |
| Backspace / Delete | Elimina keyframe o marker selezionato |
| + / − / 0 | Aumenta zoom / riduci zoom / adatta |

Il pulsante della tastiera mostra anche le scorciatoie esistenti.

## 20 effetti aggiuntivi

Le due categorie **Studio · ingressi** e **Studio · maschere** sono in cima alla libreria. Puoi assegnare i 14 effetti a entrata o uscita e regolarne i parametri nell’ispettore. Le sei nuove animazioni continue si trovano all’inizio di **Movimento continuo** e si possono sovrapporre alle transizioni.

| Gruppo | Effetti |
| --- | --- |
| 8 ingressi cinetici | Fionda, Zig-zag, Ventaglio, Origami, Passi meccanici, Elastico laterale, Nastro trasportatore, Intreccio |
| 6 maschere | Iride, Diamante, Taglio diagonale, Veneziana, Scacchiera, Pettine |
| 6 movimenti continui | Orbita ellittica, Figura a otto, Battito, Rotazione continua, Onda di taglio, Interferenza |

Le maschere funzionano anche sui livelli immagine. Tutti i parametri usano il salvataggio e l’esportazione già presenti. Le animazioni sono calcolate dal tempo del fotogramma, così anteprima e rendering della sequenza seguono lo stesso movimento.

## Verifica

Il test `tests/timeline.test.cjs` usa Playwright e un server locale sulla porta 8765. Verifica creazione e selezione delle tracce, spostamento coordinato dei keyframe, annulla/ripeti, annullamento del trascinamento, zoom e scorrimento, marker, copia/incolla, intervallo di anteprima, ripristino automatico, preset precedenti e tempi delle immagini. Controlla anche il layout mobile e gli errori del browser.

Con Playwright installato e Chromium disponibile:

```sh
node tests/timeline.test.cjs
```

Il test `tests/effects.test.cjs` verifica i 20 nuovi effetti: identificatori unici, valori limite dei parametri, geometrie valide, stato finale, rendering di entrata e uscita, maschere sulle immagini e salvataggio dei preset. Usa lo stesso server locale e Playwright del test timeline.
