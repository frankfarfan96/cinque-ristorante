'use client'

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'

/* ---------- Types ---------- */
interface BerlinTime {
  time: string
  dateLong: string
  open: boolean
  hh: number
  mm: number
  weekend: boolean
}

interface TonightSlot {
  time: string
  full: boolean
}

/* ---------- Berlin time ---------- */
function nowBerlin(): BerlinTime {
  const d = new Date()
  const fmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'long', day: '2-digit', month: 'long',
  })
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]))
  const hh = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hour12: false }).format(d), 10)
  const mm = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', minute: '2-digit' }).format(d), 10)
  const dy = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getDay()
  const mins = hh * 60 + mm
  const wk = dy === 0 || dy === 6
  const open = wk ? (mins >= 16 * 60 && mins < 24 * 60) : (mins >= 11 * 60 + 30 && mins < 24 * 60)
  return { time: `${parts.hour}:${parts.minute}`, dateLong: `${parts.weekday} ${parts.day} ${parts.month}`, open, hh, mm, weekend: wk }
}

function useBerlin(): BerlinTime {
  const [t, setT] = useState<BerlinTime>(nowBerlin)
  useEffect(() => {
    const i = setInterval(() => setT(nowBerlin()), 30000)
    return () => clearInterval(i)
  }, [])
  return t
}

/* ---------- Tonight slots ---------- */
function computeTonightSlots(): TonightSlot[] {
  const baseTimes = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
  const d = new Date()
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate()
  return baseTimes.map((t, i) => {
    const r = (seed * (i + 7)) % 11
    return { time: t, full: r > 7 }
  })
}

/* ---------- Nav ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [onDark, setOnDark] = useState(true)
  const bt = useBerlin()

  useEffect(() => {
    const handle = () => {
      setScrolled(window.scrollY > 30)
      const darks = document.querySelectorAll('.hero,.ticker,.cucina,.team,footer')
      const navY = 32
      let dark = false
      darks.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.top <= navY && r.bottom >= navY) dark = true
      })
      setOnDark(dark)
    }
    handle()
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''} ${onDark ? 'on-dark' : ''}`}>
      <a href="#top" className="brand">
        <b>Cinque</b>
        <span style={{ opacity: .5 }}>/ Ristorante · Berlino</span>
      </a>
      <ul>
        <li><a href="#filosofia">Filosofia</a></li>
        <li><a href="#cucina">Cucina</a></li>
        <li><a href="#sale">Sale Private</a></li>
        <li><a href="#galleria">Galleria</a></li>
        <li><a href="#contatto">Contatto</a></li>
      </ul>
      <div className="right">
        <span className="lang">ES / IT / DE</span>
        <a href="#prenota" className="cta">
          <span className="dot" /> {bt.open ? 'Prenota' : 'Prenota'}
        </a>
      </div>
    </nav>
  )
}

/* ---------- Hero ---------- */
function Hero() {
  const bt = useBerlin()
  const [guests, setGuests] = useState(2)
  const slots = computeTonightSlots()

  return (
    <section className="hero" id="top">

      {/* ── Left panel: solid ink background + all text ── */}
      <div className="hero-left">
        <span className="badge">
          <span className="dot" /> Dal 2006 · Berlino Mitte
        </span>

        <h1>
          <span className="hero-cinque">Cinque</span><br />
          <span className="it">Ristorante</span>
        </h1>

        <div className="hero-sub">
          <div className="blurb">
            Cucina italiana d&apos;autore, vini d&apos;autore, e cinque sale per ogni occasione — nel cuore di Berlino.
          </div>
          <div className="small">
            <div><b>Oggi · {bt.time}</b> · {bt.dateLong}</div>
            <div>
              {bt.open
                ? <>Aperto adesso · chiusura 24:00</>
                : <>Chiuso · {bt.weekend ? 'apertura 16:00' : 'apertura 11:30'}</>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: image, blends into left via gradient ── */}
      <div className="hero-right">
        <Image
          src="/hero_1.jpg"
          alt="Vista del comedor principal de Cinque Ristorante"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
      </div>

      {/* ── Tonight bar: spans full width (grid-column 1/-1) ── */}
      <div className="tonight">
        <div className="head">
          <span className="pulse" />
          <span className="label">Disponibilità</span>
          <span className="when">questa sera</span>
        </div>
        <div className="slots">
          {slots.map((s, i) => (
            <a
              key={i}
              href={s.full ? undefined : '#prenota'}
              className={`slot ${s.full ? 'full' : ''}`}
              title={s.full ? 'Completo' : 'Disponibile'}
            >
              <div className="t">{s.time}</div>
              <div className="s">{s.full ? 'Completo' : 'Disponibile'}</div>
            </a>
          ))}
        </div>
        <div className="end">
          <div className="guests">
            <button onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
            <span className="n">{guests}</span>
            <button onClick={() => setGuests(Math.min(12, guests + 1))}>+</button>
            <span className="lbl">{guests === 1 ? 'ospite' : 'ospiti'}</span>
          </div>
        </div>
      </div>

    </section>
  )
}

/* ---------- Ticker ---------- */
function Ticker() {
  const items = ["Cucina del cuore", "Antipasti", "Primi della casa", "Tagliolini al tartufo", "Vini d'autore", "Berlino Mitte", "Sale private", "Cinque", "Pesce del giorno", "MMVI"]
  const row = [...items, ...items, ...items]
  return (
    <div className="ticker">
      <div className="track">
        {row.map((w, i) => (
          <span key={i}>{w} <span className="star">●</span></span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Filosofia ---------- */
function Filosofia() {
  return (
    <section id="filosofia" className="light">
      <div className="wrap">
        <div className="sec-head">
          <span className="num">01</span> Filosofia <span className="rule" /> <span>scroll →</span>
        </div>
        <div className="filo">
          <div>
            <h2 className="big">Cinque <span className="it">passioni,</span><br />una tavola.</h2>
          </div>
          <div>
            <div className="lead">
              «Mangiare è un atto agricolo, cucinare è un atto d&apos;amore, servire è un atto di cura.»
            </div>
            <div className="body">
              Cinque non è solo il nostro nome — è il numero di gesti che custodiamo ogni giorno.
              Materia prima, fuoco, mano, tempo, ospite. Una cucina italiana che non rincorre le mode,
              ma cerca la verità del piatto: la pasta tirata al mattino, il pesce scelto all&apos;alba,
              il vino che racconta una collina.
            </div>
          </div>
        </div>
        <div className="filo-stats">
          <div className="s"><div className="n">20<span className="it">+</span></div><div className="l">Anni a Berlino</div></div>
          <div className="s"><div className="n">3</div><div className="l">Sale private</div></div>
          <div className="s"><div className="n">3</div><div className="l">Menù stagionali</div></div>
          <div className="s"><div className="n">1</div><div className="l">Terrazza estiva</div></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Cucina ---------- */
interface MenuCardData {
  tag: string
  title: ReactNode
  desc: string
  hours: string
  price: string
}

function Cucina() {
  const cards: MenuCardData[] = [
    {
      tag: '01 · Settimanale',
      title: <>Pranzo <span className="it">di lavoro</span></>,
      desc: 'Una selezione leggera che cambia ogni settimana. Pensata per chi torna in ufficio leggero e ispirato.',
      hours: 'Lun—Ven · 11:30—15:00',
      price: 'da 28€',
    },
    {
      tag: "02 · Tutto l'anno",
      title: <>Menù <span className="it">à la carte</span></>,
      desc: 'Antipasti, primi, secondi e dolci. Servizio cortese, accompagnamento musicale, consigli sui vini.',
      hours: 'Tutti i giorni · 18:00—24:00',
      price: 'à la carte',
    },
    {
      tag: '03 · Stagionale',
      title: <>Specialità <span className="it">di stagione</span></>,
      desc: "Quattro volte l'anno il menù cambia con le materie prime. La cucina italiana è prima di tutto un calendario.",
      hours: 'Primavera · Estate · Autunno · Inverno',
      price: 'da 65€',
    },
  ]
  return (
    <section className="cucina" id="cucina">
      <div className="wrap">
        <div className="sec-head">
          <span className="num">02</span> La Cucina <span className="rule" /> <span>tre menù</span>
        </div>
        <div className="intro">
          <h2 className="big">Tre menù,<br /><span className="it">un&apos;unica mano.</span></h2>
          <p>Lo Chef firma ogni menù con la stessa filosofia — cambiano la stagione e il ritmo, mai la cura.</p>
        </div>
        <div className="menus">
          {cards.map((c, i) => (
            <a key={i} href="#prenota" className="mcard">
              <div className="img">
                <div className="img-slot" />
                <div className="tag">{c.tag}</div>
              </div>
              <div className="body">
                <h3>{c.title}</h3>
                <div className="desc">{c.desc}</div>
                <div className="row">
                  <div className="hr">{c.hours}</div>
                  <div className="price">{c.price}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Dishes ---------- */
function Dishes() {
  const dishes = [
    { tag: 'Antipasto', name: 'Burrata di Andria', sub: 'con pomodorini confit e basilico fresco', price: '' },
    { tag: 'Primo', name: 'Tagliolini al tartufo', sub: 'pasta tirata al mattino', price: '' },
    { tag: 'Secondo', name: 'Branzino al sale', sub: 'pescato del giorno, verdure di stagione', price: '' },
    { tag: 'Dolce', name: 'Tiramisù Cinque', sub: 'ricetta della casa, mascarpone fresco', price: '' },
  ]
  return (
    <section className="dishes light">
      <div className="wrap">
        <div className="head">
          <h2 className="big">Piatti che <span className="it">raccontano una collina.</span></h2>
          <div className="meta">
            Selezione stagionale<br />
            <span style={{ color: 'var(--wine)' }}>Vedi la Speisekarte →</span>
          </div>
        </div>
        <div className="dlist">
          {dishes.map((d, i) => (
            <div className="dish" key={i}>
              <div className="pic"><div className="img-slot" /></div>
              <div className="row1">
                <span className="tag">— {d.tag}</span>
                {d.price && <span className="price">{d.price}</span>}
              </div>
              <h4>{d.name}</h4>
              <div className="sub">{d.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Sale ---------- */
interface SaleCard {
  cls: string
  tag: string
  cap: number
  name: ReactNode
  desc: string
}

function Sale() {
  const cards: SaleCard[] = [
    { cls: 's1', tag: 'Sala 01 · Séparée', cap: 30, name: <>Il <span className="it">Séparée</span></>, desc: 'Zona riservata per cene aziendali e celebrazioni familiari. Fino a trenta ospiti.' },
    { cls: 's2', tag: 'Sala 02 · Flügelsaal', cap: 40, name: <>Il <span className="it">Flügelsaal</span></>, desc: 'La nostra sala più ampia — matrimoni, ricorrenze e ricevimenti fino a quaranta ospiti.' },
    { cls: 's3', tag: 'Sala 03 · Lounge', cap: 16, name: <>Il <span className="it">Lounge</span></>, desc: 'Ingresso privato indipendente. Atmosfera intima per cene riservate fino a sedici persone.' },
    { cls: 's4', tag: 'Terrazza', cap: 0, name: <>La <span className="it">Terrazza</span></>, desc: 'Aperta in estate, la terrazza offre un\'oasi di verde nel cuore di Berlino.' },
    { cls: 's5', tag: 'Veranstaltungen', cap: 0, name: <>Eventi <span className="it">su misura</span></>, desc: 'Presentazioni aziendali, cene di gala e celebrazioni private con menù costruiti su misura.' },
  ]
  return (
    <section className="sale light" id="sale">
      <div className="wrap">
        <div className="sec-head">
          <span className="num">03</span> Le Sale <span className="rule" /> <span>privato &amp; corporativo</span>
        </div>
        <div className="head">
          <h2 className="big">Una casa con <span className="it">cinque stanze.</span></h2>
          <p>Privato o corporativo: vi accompagniamo nella pianificazione completa — celebrazioni familiari, cene di lavoro, matrimoni. Proposte gastronomiche costruite su misura.</p>
        </div>
        <div className="sale-grid">
          {cards.map((c, i) => (
            <a key={i} className={`sale-card ${c.cls}`} href="#prenota">
              <div className="img-slot" />
              <div className="tag">{c.tag}</div>
              {c.cap > 0 && <div className="cap"><span className="n">{c.cap}</span>ospiti</div>}
              <div className="body">
                <h4>{c.name}</h4>
                <div className="desc">{c.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Galleria ---------- */
interface GalleryTile {
  col: string
  row: string
  tag: string
  cat?: string
}

function Galleria() {
  const [f, setF] = useState('Tutto')
  const tiles: GalleryTile[] = [
    { col: 'span 6', row: 'span 3', tag: 'La Sala' },
    { col: 'span 3', row: 'span 2', tag: 'Vino', cat: 'Speisen' },
    { col: 'span 3', row: 'span 2', tag: 'Pesce del giorno', cat: 'Speisen' },
    { col: 'span 4', row: 'span 2', tag: 'Terrazza', cat: 'Terrasse' },
    { col: 'span 4', row: 'span 2', tag: 'Antipasto', cat: 'Speisen' },
    { col: 'span 4', row: 'span 2', tag: 'Dolci', cat: 'Speisen' },
    { col: 'span 3', row: 'span 2', tag: 'Séparée', cat: 'Räume' },
    { col: 'span 3', row: 'span 2', tag: 'Flügelsaal', cat: 'Räume' },
    { col: 'span 6', row: 'span 2', tag: 'Mise en place', cat: 'Räume' },
  ]
  const filters = ['Tutto', 'Speisen', 'Räume', 'Terrasse']
  return (
    <section className="gal" id="galleria">
      <div className="wrap">
        <div className="sec-head">
          <span className="num">04</span> Galleria <span className="rule" /> <span>impressioni</span>
        </div>
        <div className="head">
          <h2 className="big">Impressioni dalla<br /><span className="it">mesa stagionale.</span></h2>
          <div>
            <div className="filters">
              {filters.map(x => (
                <button key={x} className={f === x ? 'on' : ''} onClick={() => setF(x)}>{x}</button>
              ))}
            </div>
            <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 20, color: 'var(--muted)', lineHeight: 1.4 }}>
              Cibo, sale private e terrazza. Una camera lenta dentro casa nostra.
            </div>
          </div>
        </div>
        <div className="ggrid">
          {tiles.map((t, i) => {
            const show = f === 'Tutto' || (t.cat || 'Räume') === f
            if (!show) return null
            return (
              <div key={i} className="gtile" style={{ gridColumn: t.col, gridRow: t.row }}>
                <div className="img-slot" />
                <div className="tag">— {t.tag}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- Team ---------- */
function Team() {
  return (
    <section className="team">
      <div className="grid">
        <div className="left">
          <div className="sec-head" style={{ color: 'rgba(244,241,235,.5)', borderTopColor: 'rgba(244,241,235,.12)' }}>
            <span className="num" style={{ color: 'var(--paper)' }}>05</span> La Squadra <span className="rule" />
          </div>
          <h2>La nostra <span className="it">squadra<br />in sala.</span></h2>
          <div className="quote">«Cucina italiana autentica, servita da un team eccellente e motivato — ogni giorno con la stessa passione dal 2006.»</div>
          <div className="sig">— Ristorante &amp; Bar Cinque</div>
          <div className="role">Leitung Ristorante · Berlino Mitte</div>
        </div>
        <div className="photo">
          <div className="img-slot" />
        </div>
      </div>
    </section>
  )
}

/* ---------- Reserva ---------- */
function Reserva() {
  const [step, setStep] = useState(1)
  const [guests, setGuests] = useState<number | string>(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  const times = ['12:00', '13:00', '14:00', '18:30', '19:30', '20:30', '21:30']

  useEffect(() => {
    if (!date) {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      setDate(d.toISOString().slice(0, 10))
    }
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !time) return
    setDone(true)
  }

  return (
    <section className="reserva light" id="prenota">
      <div className="bignum">5</div>
      <div className="reserva-wrap">
        <div>
          <div className="sec-head">
            <span className="num">06</span> Prenotazione <span className="rule" />
          </div>
          <h2>Riservate<br />la vostra <span className="it">serata.</span></h2>
          <div className="lead">
            Confermiamo entro un&apos;ora durante l&apos;orario di servizio. Per gruppi di oltre otto persone, si prega di chiamare direttamente.
          </div>
          <div className="phone">
            <span className="pdot" />
            <div>
              <div className="num">030 · 280 96 224</div>
              <div className="lab">Risposta in giornata</div>
            </div>
          </div>
        </div>

        <form className="resform" onSubmit={submit}>
          {!done && (
            <>
              <div className="progress">
                <span className={step >= 1 ? 'active' : ''}>01 · Ospiti &amp; data</span>
                <span className={step >= 2 ? 'active' : ''}>02 · I tuoi dati</span>
              </div>
              {step === 1 && (
                <>
                  <div className="field">
                    <label>Quante persone</label>
                    <div className="chips">
                      {([1, 2, 3, 4, 5, 6, 7, '8+'] as (number | string)[]).map(n => (
                        <button type="button" key={n} className={`chip ${guests === n ? 'sel' : ''}`} onClick={() => setGuests(n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div className="row2">
                    <div className="field">
                      <label>Giorno</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Ora</label>
                      <select value={time} onChange={e => setTime(e.target.value)}>
                        <option value="">Selezionare —</option>
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="button" className="submit" onClick={() => setStep(2)} disabled={!time}>Avanti →</button>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="field">
                    <label>Nome &amp; cognome</label>
                    <input type="text" placeholder="Mario Rossi" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Telefono</label>
                    <input type="tel" placeholder="+49 ..." value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="row2">
                    <button type="button" className="submit ghost" onClick={() => setStep(1)}>← Indietro</button>
                    <button type="submit" className="submit">Confermare</button>
                  </div>
                </>
              )}
            </>
          )}
          {done && (
            <div className="confirmed">
              <div className="ck">✓</div>
              <h3>Tavolo riservato.</h3>
              <p>Vi aspettiamo, {name.split(' ')[0] || 'cara amica'}.<br />Riceverete conferma a breve.</p>
              <div className="recap">{guests} ospiti · {date} · {time}<br />Cinque Ristorante · Berlino</div>
              <button type="button" className="reset" onClick={() => { setDone(false); setStep(1); setName(''); setPhone(''); setTime('') }}>
                Nuova prenotazione
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */
function Foot() {
  const bt = useBerlin()
  return (
    <footer id="contatto">
      <div className="ft-top">
        <div className="col big">
          <h3>Cinque<br /><span className="it">Ristorante.</span></h3>
          <p className="lead">
            Cucina italiana d&apos;autore nel cuore di Berlino dal 2006. Una casa per pranzi di lavoro, cene private e celebrazioni.
          </p>
          <div className="status">
            <span className="dot" /> {bt.open ? 'Aperto adesso · chiusura 24:00' : 'Chiuso · si apre più tardi'}
          </div>
        </div>
        <div className="col">
          <h4>Indirizzo</h4>
          <p>Cinque Ristorante<br />Berlino · Mitte<br />Germania</p>
        </div>
        <div className="col">
          <h4>Orari</h4>
          <p>Lun—Ven<br /><em>11:30 — 24:00</em></p>
          <p style={{ marginTop: 12 }}>Sab · Dom · Festivi<br /><em>16:00 — 24:00</em></p>
        </div>
        <div className="col">
          <h4>Contatto</h4>
          <a href="tel:+4930280962240">030 · 280 96 224</a>
          <a href="mailto:info@ristorante-cinque.de">info@ristorante-cinque.de</a>
          <a href="https://www.instagram.com/ristorante_cinque" target="_blank" rel="noopener noreferrer">@ristorante_cinque →</a>
          <a href="https://www.ristorante-cinque.de" target="_blank" rel="noopener noreferrer">ristorante-cinque.de →</a>
        </div>
      </div>

      {/* Mega "CINQUE" — wine red as requested */}
      <div className="ft-mega">
        <div className="word">C<span className="it">i</span>nq<span className="it">u</span>e</div>
      </div>

      <div className="ft-base">
        <div className="lk">
          <Image src="/logo_restaurante.png" alt="Cinque Ristorante" width={120} height={32} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          <span>© Ristorante &amp; Bar Cinque GmbH · MMVI — MMXXVI</span>
        </div>
        <div>
          <a href="#" style={{ marginRight: 24 }}>Aviso legal</a>
          <a href="#">Política de privacidad</a>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Floating Dock ---------- */
function Dock() {
  const [show, setShow] = useState(false)
  const bt = useBerlin()

  useEffect(() => {
    const fn = () => setShow(window.scrollY > window.innerHeight * 1.1)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className={`dock ${show ? 'show' : ''}`}>
      <div className="info">
        <span className="t">{bt.open ? 'Aperto adesso' : 'Chiuso adesso'}</span>
        <span className="v">questa sera</span>
      </div>
      <a href="#prenota" className="go">Prenota →</a>
    </div>
  )
}

/* ---------- Page ---------- */
export default function Page() {
  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <Filosofia />
      <Cucina />
      <Dishes />
      <Sale />
      <Galleria />
      <Team />
      <Reserva />
      <Foot />
      <Dock />
    </>
  )
}
