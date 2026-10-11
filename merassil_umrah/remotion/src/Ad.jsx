import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Audio, Sequence, staticFile,
  useCurrentFrame, interpolate, spring, Easing,
} from 'remotion';

export const FPS = 30;
export const DURATION = 44.4; // 42.42s raw + CTA hold

const GOLD = '#E8A93A';
const GOLD_D = '#C98A1E';
const BLUE = '#1F3F8F';
const a = (n) => staticFile(`a/${n}.jpg`);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// The raw is square (1076x1080). After the intro it sits in a framed "card" in the middle of the 9:16 canvas:
// top band = logo + motion icons, bottom band = captions.
const FRAME = { top: 400, size: 1080 };
const CAPTION_TOP = 1500;

// ---------------- timeline: scene cuts detected in the raw ----------------
const CTA_AT = 39.55;
const CUTS = [9.93, 14.4, 15.0, 18.17, 20.57, 24.73, 26.0, 29.7, 31.7, 33.57, 35.27, CTA_AT];
const FAST = [15.0]; // plane exterior -> window is only 0.6s long, use a quick flash
const TRANSITIONS = CUTS.map((t) => ({ t, fast: FAST.includes(t) }));

// punch-in zooms on the framed footage (time, amount)
const PUNCH = [[13.18, 1.08], [19.22, 1.08], [22.76, 1.06], [28.5, 1.08], [36.74, 1.1], [38.66, 1.14]];

// captions: s = small top, b = big gold keyword, u = small under
const CAPS = [
  { t: [0.1, 0.85], s: 'السلام عليكم' },
  { t: [0.9, 2.16], b: 'مراسيل', u: 'Voyages رجعنا لكم' },
  { t: [2.18, 5.06], s: 'ببرنامج', b: 'عمرة', u: 'لموسم 2026/2027' },
  { t: [5.14, 6.7], s: 'ولخدمة أفضل', b: 'ضيوف الرحمن' },
  { t: [6.74, 8.05], s: 'جبنا لكم', b: 'عرضين', u: 'للعمرة' },
  { t: [8.12, 9.92], s: 'عمرة', b: 'VIP', u: 'وعمرة اقتصادي' },
  { t: [10.0, 12.22], s: 'كان اللي عاش عمره كامل', b: 'يستنى', u: 'هاد النهار' },
  { t: [12.28, 14.34], s: 'واليوم إن شاء الله', b: 'الحلم', u: 'يولي حقيقة' },
  { t: [14.42, 16.68], s: 'طيران', b: 'مباشر', u: 'من الجزائر لأرض الحرمين' },
  { t: [16.82, 19.12], s: 'بلا توقف وبلا تعب', b: 'الإقامة', u: 'على حسابك' },
  { t: [19.22, 20.88], b: 'VIP', u: 'للي يحب الراحة الكاملة' },
  { t: [20.94, 22.32], b: 'الاقتصادي', u: 'بأحسن قيمة' },
  { t: [22.4, 23.82], s: 'المهم', b: 'تختار', u: 'اللي يريحك' },
  { t: [23.88, 25.84], s: 'وقبل ما نطيروا كل معتمر', b: 'ياخد هديته' },
  { t: [25.9, 26.64], b: 'حقيبة', u: 'خاصة' },
  { t: [26.7, 27.54], b: 'إحرام', u: 'للرجال' },
  { t: [27.6, 28.44], b: 'خمار', u: 'للنساء' },
  { t: [28.5, 29.18], s: 'وماء', b: 'زمزم' },
  { t: [29.26, 31.68], s: 'والحمد لله وصلنا', b: 'مكة المكرمة' },
  { t: [31.76, 33.48], s: 'وما تخممش في والو', b: 'مرشد ديني', u: 'معاك' },
  { t: [33.5, 35.24], s: 'من أول خطوة', b: 'حتى آخر طواف' },
  { t: [35.34, 36.46], s: 'العمرة', b: 'ماشي غير رحلة' },
  { t: [36.52, 38.5], s: 'هي', b: 'ذكرى', u: 'تبقى معاك طول عمرك' },
  { t: [38.58, 39.52], s: 'ما تخليهاش', b: 'العام الجاي' },
];

// gold 3D icons popping in (motion graphics). Intro: around the cut-out speaker. After: in the top band / frame corner.
const BAND_Y = 205; // center of the top band
const POPS = [
  // intro
  { t: [2.7, 5.05], src: 'gold_calendar_icon_on_black', x: 830, y: 520, size: 360, label: '2026/2027' },
  { t: [5.14, 6.7], src: 'gold_kaaba_on_pedestal', x: 830, y: 520, size: 360 },
  { t: [7.2, 9.9], src: 'gold_crown_with_royal-blue_gems', x: 250, y: 520, size: 360, enter: 8.4, label: 'VIP' },
  { t: [7.2, 9.9], src: 'gold_coins_with_checkmark', x: 830, y: 520, size: 360, enter: 9.02, label: 'اقتصادي' },
  // framed part (top band, right side so the logo keeps the left)
  { t: [12.28, 14.34], src: 'gold_heart_with_inner_glow', x: 900, y: BAND_Y, size: 330, enter: 13.18 },
  { t: [14.42, 16.1], src: 'gold_airliner_banking_upward', x: 870, y: BAND_Y, size: 380 },
  { t: [16.1, 18.1], src: 'gold_globe_showing_flight_arc', x: 900, y: BAND_Y, size: 340 },
  { t: [18.2, 19.15], src: 'gold_crescent_and_dome_icon', x: 900, y: BAND_Y, size: 330, enter: 18.2 },
  { t: [19.22, 20.9], src: 'gold_crown_with_royal-blue_gems', x: 900, y: BAND_Y, size: 340 },
  { t: [20.94, 22.35], src: 'gold_coins_with_checkmark', x: 900, y: BAND_Y, size: 340 },
  { t: [23.88, 25.85], src: 'gift_box_opening', x: 900, y: BAND_Y, size: 340, enter: 25.54 },
  { t: [29.26, 31.68], src: 'gold_kaaba_on_pedestal', x: 900, y: BAND_Y, size: 340, enter: 30.84 },
  { t: [31.76, 35.24], src: 'golden_person_silhouette_holding', x: 900, y: BAND_Y, size: 340, enter: 32.64 },
  { t: [36.52, 38.55], src: 'gold_heart_with_inner_glow', x: 900, y: BAND_Y, size: 340, enter: 36.74 },
  { t: [38.58, 39.52], src: 'gold_calendar_icon_on_black', x: 900, y: BAND_Y, size: 330, enter: 39.04 },
];
// gift checklist: 4 icons fill a row one by one under the logo band
const GIFTS = [
  { at: 25.9, src: 'golden_suitcase_on_black_background' },
  { at: 26.7, src: 'folded_white_cloth_with_ribbon' },
  { at: 27.6, src: 'folded_khimar_on_gold_tray' },
  { at: 28.5, src: 'glass_bottle_of_water' },
];
const GIFTS_END = 29.65;

const SFX = [
  ...TRANSITIONS.map((x) => ({ t: x.t - (x.fast ? 0.12 : 0.25), f: x.fast ? 'swish' : 'whoosh', v: x.fast ? 0.35 : 0.45 })),
  ...POPS.map((p) => ({ t: p.enter ?? p.t[0], f: 'pop', v: 0.5 })),
  ...GIFTS.map((g) => ({ t: g.at, f: 'tick', v: 0.6 })),
  { t: 0.05, f: 'shimmer', v: 0.35 },
  { t: 0.9, f: 'shimmer', v: 0.25 },
  { t: 8.4, f: 'shimmer', v: 0.3 },
  { t: 19.22, f: 'shimmer', v: 0.35 },
  { t: 29.7, f: 'impact', v: 0.45 },
  { t: 38.35, f: 'riser', v: 0.35 },
  { t: CTA_AT, f: 'impact', v: 0.55 },
  { t: CTA_AT + 1.05, f: 'pop', v: 0.5 }, { t: CTA_AT + 1.65, f: 'pop', v: 0.5 }, { t: CTA_AT + 2.25, f: 'shimmer', v: 0.35 },
];

// ---------------- helpers ----------------
const useT = (off = 0) => useCurrentFrame() / FPS + off;
const goldText = {
  background: `linear-gradient(180deg,#FFF1C4 0%,${GOLD} 38%,#9C6A12 62%,#FFD77A 100%)`,
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
};
const deepGlow = (k = 1) =>
  `drop-shadow(0 0 ${6 * k}px rgba(255,200,90,.55)) drop-shadow(0 0 ${22 * k}px rgba(232,169,58,.45)) drop-shadow(0 0 ${60 * k}px rgba(201,138,30,.35))`;
const iconMask = (inner = 42, outer = 68) => ({
  mixBlendMode: 'screen', objectFit: 'cover',
  WebkitMaskImage: `radial-gradient(circle, #000 ${inner}%, transparent ${outer}%)`, maskImage: `radial-gradient(circle, #000 ${inner}%, transparent ${outer}%)`,
});
const transitionAmount = (t) => {
  let best = 0;
  for (const tr of TRANSITIONS) {
    const half = tr.fast ? 0.125 : 0.25;
    const d = Math.abs(t - tr.t);
    if (d < half) best = Math.max(best, 1 - d / half);
  }
  return best;
};
const full = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

// ---------------- background (reference style: black texture + gold dashed curves) ----------------
const GoldLinesBg = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: '#050505' }}>
      <Img src={a('golden_lines_on_dark_background')} style={{ ...full, transform: `scale(${1.08 + 0.04 * Math.sin(t * 0.3)}) rotate(${t * 0.15}deg)` }} />
      <Img src={a('gold_dust_floating_in_void')} style={{ ...full, mixBlendMode: 'screen', opacity: 0.3, transform: `translateY(${-(t * 12) % 300}px) scale(1.3)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,.75) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------------- intro: speaker cut out of his office, on the black/gold set ----------------
const Intro = () => {
  const t = useT();
  const z = interpolate(t, [0, 9.93], [1.0, 1.08]) * interpolate(t, [2.72, 2.95], [1, 1.04], clamp) * interpolate(t, [8.4, 8.6], [1, 1.04], clamp);
  return (
    <AbsoluteFill>
      <GoldLinesBg />
      {/* gold halo behind the head */}
      <div style={{ position: 'absolute', left: 140, top: 380, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,58,.28), transparent 65%)', filter: 'blur(20px)' }} />
      <AbsoluteFill style={{ filter: 'drop-shadow(0 0 30px rgba(232,169,58,.35))' }}>
        <OffthreadVideo src={staticFile('intro_cut.webm')} transparent muted
          style={{ position: 'absolute', left: -40, top: 470, width: 1160, height: 1160 * (1084 / 1080), transform: `scale(${z})`, transformOrigin: '50% 30%', filter: 'contrast(1.05) saturate(1.05)' }} />
      </AbsoluteFill>
      {/* fade body into the black at the bottom so captions sit cleanly */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 62%, rgba(0,0,0,.85) 80%, #000 95%)' }} />
    </AbsoluteFill>
  );
};

// ---------------- framed raw footage (all scenes after the intro) ----------------
const Framed = () => {
  const t = useT(9.93);
  let z = 1.02;
  for (const [pt, amt] of PUNCH) z *= interpolate(t, [pt - 0.12, pt + 0.18, pt + 1.6], [1, amt, amt * 0.985], clamp);
  const enter = spring({ frame: (t - 9.93) * FPS, fps: FPS, config: { damping: 16 } });
  return (
    <AbsoluteFill>
      <GoldLinesBg />
      <div style={{
        position: 'absolute', left: 0, top: FRAME.top, width: FRAME.size, height: FRAME.size, overflow: 'hidden',
        borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`,
        boxShadow: `0 0 50px rgba(232,169,58,.45), 0 0 120px rgba(201,138,30,.25)`,
        transform: `scale(${0.92 + 0.08 * enter})`,
      }}>
        <OffthreadVideo src={staticFile('raw.mp4')} muted startFrom={Math.round(9.93 * FPS)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'contrast(1.06) saturate(1.06) sepia(.06)' }} />
        <Img src={a('golden_lines_on_dark_background')} style={{ ...full, mixBlendMode: 'screen', opacity: 0.22 }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.45) 100%)' }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------- icon pop (motion graphic) ----------------
const Pop = ({ p }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const enter = p.enter ?? p.t[0];
  if (t < enter - 0.05 || t > p.t[1]) return null;
  const s = spring({ frame: frame - enter * FPS, fps: FPS, config: { damping: 13, stiffness: 140 } });
  const out = interpolate(t, [p.t[1] - 0.2, p.t[1]], [1, 0], clamp);
  const float = Math.sin((t - enter) * 2.2) * 10;
  return (
    <div style={{
      position: 'absolute', left: p.x - p.size / 2, top: p.y - p.size / 2 + float, width: p.size, height: p.size,
      transform: `scale(${(0.4 + 0.6 * s) * (0.9 + 0.1 * out)}) rotate(${(1 - s) * -25}deg) translateY(${(1 - s) * 120}px)`,
      opacity: Math.min(1, s * 1.6) * out, filter: `blur(${(1 - s) * 16 + (1 - out) * 10}px) ${deepGlow(0.8)}`, // blur while moving = motion blur
    }}>
      <Img src={a(p.src)} style={{ width: '100%', height: '100%', ...iconMask() }} />
      {p.label && (
        <div style={{ position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', fontFamily: /^[0-9A-Z]/.test(p.label) ? 'Montserrat' : 'Amiri', fontWeight: 700, fontSize: 46, letterSpacing: 2, ...goldText }}>{p.label}</div>
      )}
    </div>
  );
};

const GiftRow = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < GIFTS[0].at - 0.05 || t > GIFTS_END) return null;
  const out = interpolate(t, [GIFTS_END - 0.25, GIFTS_END], [1, 0], clamp);
  const W = 190;
  return (
    <div style={{ position: 'absolute', right: 30, top: BAND_Y - W / 2 + 10, display: 'flex', gap: 6, opacity: out, filter: `blur(${(1 - out) * 8}px)` }}>
      {GIFTS.map((g, i) => {
        const s = spring({ frame: frame - g.at * FPS, fps: FPS, config: { damping: 12, stiffness: 170 } });
        const on = t >= g.at;
        return (
          <div key={i} style={{ position: 'relative', width: W, height: W, opacity: on ? Math.min(1, s * 1.5) : 0.18, transform: `scale(${on ? 0.5 + 0.5 * s : 0.8}) translateY(${on ? (1 - s) * 60 : 0}px)`, filter: on ? `blur(${(1 - s) * 10}px) ${deepGlow(0.6)}` : 'grayscale(1)' }}>
            <Img src={a(g.src)} style={{ width: '100%', height: '100%', ...iconMask(40, 66) }} />
            {on && (
              <div style={{ position: 'absolute', right: 18, bottom: 18, width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(180deg, ${GOLD}, ${GOLD_D})`, color: '#111', fontSize: 34, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 0 14px rgba(232,169,58,.8)' }}>✓</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------- captions: two-tier (small white sans / big gold serif) ----------------
const Caption = ({ c }) => {
  const t = useT(c.t[0]);
  const [t0, t1] = c.t;
  const reveal = (d) => interpolate(t, [t0 + d, t0 + d + 0.28], [0, 1], { ...clamp, easing: ease });
  const out = interpolate(t, [t1 - 0.12, t1], [1, 0], clamp);
  const line = (txt, d, st) => {
    const r = reveal(d);
    return (
      <div style={{
        ...st, opacity: r * out,
        transform: `translateY(${(1 - r) * 26}px) scale(${1 + (1 - r) * 0.12})`,
        filter: `blur(${(1 - r) * 12 + (1 - out) * 8}px)`,
        clipPath: `inset(0 0 0 ${(1 - r) * 100}%)`, // RTL wipe: reveals from the right
      }}>{txt}</div>
    );
  };
  const small = { fontFamily: 'Cairo', fontWeight: 600, fontSize: 46, color: '#F4EEE2', textShadow: '0 2px 12px rgba(0,0,0,.8)' };
  const isLatin = /^[A-Za-z]/.test(c.b ?? '');
  const big = {
    fontFamily: isLatin ? 'Playfair Display' : 'Amiri', fontStyle: isLatin ? 'italic' : 'normal', fontWeight: 700,
    fontSize: (c.b ?? '').length > 8 ? 108 : 132, lineHeight: 1.15, ...goldText, padding: '0 20px',
  };
  return (
    <div dir="rtl" style={{ position: 'absolute', left: 60, right: 60, top: CAPTION_TOP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
      {c.s && line(c.s, 0, small)}
      {c.b && <div style={{ filter: deepGlow(1) }}>{line(c.b, c.s ? 0.12 : 0, big)}</div>}
      {c.u && line(c.u, 0.24, { ...small, fontWeight: 400, fontSize: 42 })}
    </div>
  );
};

// ---------------- transition: gold/blue ribbon sweep from the logo + flash (0.5s) ----------------
const LogoTransition = () => {
  const t = useT();
  const tr = TRANSITIONS.find((x) => Math.abs(t - x.t) < (x.fast ? 0.125 : 0.25));
  if (!tr) return null;
  const half = tr.fast ? 0.125 : 0.25;
  const p = (t - (tr.t - half)) / (2 * half);
  const flash = 1 - Math.abs(p - 0.5) * 2;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {!tr.fast && (
        <>
          <div style={{ position: 'absolute', left: -800, top: -400, width: 620, height: 3200, background: `linear-gradient(90deg, transparent, ${GOLD_D}, #FFE3A0, ${GOLD}, transparent)`, transform: `translateX(${interpolate(p, [0, 1], [-300, 2600])}px) rotate(28deg)`, filter: 'blur(6px)', opacity: 0.95 }} />
          <div style={{ position: 'absolute', left: -800, top: -400, width: 300, height: 3200, background: `linear-gradient(90deg, transparent, ${BLUE}, #3D66C9, transparent)`, transform: `translateX(${interpolate(p, [0, 1], [-650, 2300])}px) rotate(28deg)`, filter: 'blur(4px)', opacity: 0.9 }} />
        </>
      )}
      <Img src={a('golden_light_leak_on_black')} style={{ ...full, mixBlendMode: 'screen', opacity: flash * 0.9, transform: `scale(${1.2 + p * 0.4}) translateX(${(p - 0.5) * 300}px)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,226,160,${flash * 0.55}), transparent 60%)`, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

// ---------------- persistent logo, top-left ----------------
const Logo = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 6, fps: FPS, config: { damping: 18 } });
  if (frame / FPS > CTA_AT) return null; // CTA shows the big logo
  return <Img src={staticFile('logo.png')} style={{ position: 'absolute', left: 44, top: 70, width: 270, opacity: s * 0.97, transform: `translateX(${(1 - s) * -40}px)`, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7)) drop-shadow(0 0 14px rgba(232,169,58,.35))' }} />;
};

// ---------------- CTA ----------------
const CTA = () => {
  const frame = useCurrentFrame() + Math.round(CTA_AT * FPS);
  const t = frame / FPS;
  const at = (d) => spring({ frame: frame - (CTA_AT + d) * FPS, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const item = (d, children) => {
    const s = at(d);
    return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`, filter: `blur(${(1 - s) * 10}px)` }}>{children}</div>;
  };
  const pulse = 1 + 0.03 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <Img src={a('dark_background_with_golden_bokeh')} style={{ ...full, transform: `scale(${1.1 + (t - CTA_AT) * 0.01})` }} />
      <Img src={a('golden_lines_on_dark_background')} style={{ ...full, mixBlendMode: 'screen', opacity: 0.6 }} />
      <AbsoluteFill dir="rtl" style={{ alignItems: 'center', paddingTop: 230, gap: 26, fontFamily: 'Cairo' }}>
        {item(0, <Img src={staticFile('logo.png')} style={{ width: 640, filter: deepGlow(0.7) }} />)}
        {item(0.25, <div style={{ fontSize: 50, color: '#F4EEE2', fontWeight: 600 }}>اتصل بنا</div>)}
        {item(0.4, <div style={{ fontFamily: 'Amiri', fontWeight: 700, fontSize: 150, lineHeight: 1, ...goldText, filter: deepGlow(1.1) }}>الآن</div>)}
        {item(1.05, (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 42px 18px 30px', borderRadius: 999, border: `3px solid ${GOLD}`, background: 'linear-gradient(180deg, rgba(31,63,143,.55), rgba(10,18,45,.75))', boxShadow: `0 0 40px rgba(232,169,58,.45), inset 0 0 20px rgba(232,169,58,.25)`, transform: `scale(${pulse})` }}>
            <Img src={a('gold_smartphone_receiver_icon')} style={{ width: 120, height: 120, ...iconMask(40, 66) }} />
            <div dir="ltr" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: 72, letterSpacing: 3, ...goldText }}>0795 718 786</div>
          </div>
        ))}
        {item(1.65, (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Img src={a('gold_location_pin_on_black')} style={{ width: 100, height: 100, ...iconMask(40, 66) }} />
            <div style={{ fontSize: 44, color: '#F4EEE2', fontWeight: 600 }}>الدرارية، الجزائر العاصمة</div>
          </div>
        ))}
        {item(2.25, <div dir="ltr" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: 46, color: '#F4EEE2', letterSpacing: 1 }}>@merassil_voyages</div>)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- stage: zoom + blur through each cut (part of the transition) ----------------
const Stage = ({ children }) => {
  const t = useT();
  const k = transitionAmount(t);
  return <AbsoluteFill style={{ transform: `scale(${1 + k * 0.18})`, filter: k > 0.01 ? `blur(${k * 16}px) brightness(${1 + k * 0.5})` : undefined }}>{children}</AbsoluteFill>;
};

export const Ad = ({ layers }) => {
  const overlayOnly = layers === 'overlay';
  const f = (s) => Math.round(s * FPS);
  const total = f(DURATION);
  return (
    <AbsoluteFill style={{ background: overlayOnly ? 'transparent' : '#000' }}>
      {!overlayOnly && (
        <Stage>
          <Sequence from={0} durationInFrames={f(9.93)} layout="none"><Intro /></Sequence>
          <Sequence from={f(9.93)} durationInFrames={f(CTA_AT) - f(9.93)} layout="none"><Framed /></Sequence>
          <Sequence from={f(CTA_AT)} durationInFrames={total - f(CTA_AT)} layout="none"><CTA /></Sequence>
        </Stage>
      )}
      {overlayOnly && <Sequence from={f(CTA_AT)} layout="none"><CTA /></Sequence>}
      {POPS.map((p, i) => <Pop key={i} p={p} />)}
      <GiftRow />
      {CAPS.map((c, i) => (
        <Sequence key={i} from={f(c.t[0])} durationInFrames={f(c.t[1]) - f(c.t[0]) + 1} layout="none">
          <Caption c={c} />
        </Sequence>
      ))}
      <Logo />
      <LogoTransition />
      {!overlayOnly && <Audio src={staticFile('raw.mp4')} />}
      {!overlayOnly && SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, f(s.t))} layout="none">
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
