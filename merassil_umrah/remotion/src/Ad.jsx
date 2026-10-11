import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Audio, Sequence, staticFile,
  useCurrentFrame, interpolate, spring, Easing,
} from 'remotion';

export const FPS = 30;
export const DURATION = 44.4; // 42.45s voice + CTA hold

const GOLD = '#E8A93A';
const GOLD_D = '#C98A1E';
const BLUE = '#1F3F8F';
const a = (n) => staticFile(`a/${n}.jpg`);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// ---------------- timeline (seconds, aligned to the voice track) ----------------
// kind: speaker | intro | card | video | cta
const SEGMENTS = [
  { from: 0, to: 10.0, kind: 'intro' },
  { from: 10.0, to: 14.35, kind: 'speaker', punch: [[13.18, 1.08]] },
  { from: 14.35, to: 16.7, kind: 'card', src: 'gold_airliner_banking_upward', drift: [1.0, 1.14], pan: [-40, 40] },
  { from: 16.7, to: 19.15, kind: 'card', src: 'gold_globe_showing_flight_arc', drift: [1.12, 1.0], pan: [0, 0] },
  { from: 19.15, to: 20.9, kind: 'card', src: 'gold_crown_with_royal-blue_gems', drift: [1.0, 1.15] },
  { from: 20.9, to: 22.35, kind: 'card', src: 'gold_coins_with_checkmark', drift: [1.15, 1.02] },
  { from: 22.35, to: 23.85, kind: 'speaker', punch: [[22.76, 1.1]] },
  { from: 23.85, to: 25.85, kind: 'card', src: 'gift_box_opening', drift: [1.0, 1.16] },
  { from: 25.85, to: 26.65, kind: 'card', src: 'golden_suitcase_on_black_background', drift: [1.18, 1.05] },
  { from: 26.65, to: 27.55, kind: 'card', src: 'folded_white_cloth_with_ribbon', drift: [1.05, 1.18] },
  { from: 27.55, to: 28.45, kind: 'card', src: 'folded_khimar_on_gold_tray', drift: [1.18, 1.05] },
  { from: 28.45, to: 29.2, kind: 'card', src: 'glass_bottle_of_water', drift: [1.05, 1.16] },
  { from: 29.2, to: 31.7, kind: 'video', src: 'makkah' },
  { from: 31.7, to: 33.5, kind: 'card', src: 'golden_person_silhouette_holding', drift: [1.0, 1.12] },
  { from: 33.5, to: 35.25, kind: 'card', src: 'gold_kaaba_on_pedestal', drift: [1.14, 1.0] },
  { from: 35.25, to: 39.55, kind: 'speaker', punch: [[36.74, 1.1], [38.66, 1.14]] },
  { from: 39.55, to: DURATION, kind: 'cta' },
];
// full logo transitions (0.5s) vs quick flash cuts (0.25s) inside the gifts list
const TRANSITIONS = SEGMENTS.slice(1).map((s) => ({
  t: s.from,
  fast: [26.65, 27.55, 28.45, 25.85].includes(s.from),
}));

// captions: s = small top, b = big gold keyword, u = small under
const CAPS = [
  { t: [0.1, 0.85], s: 'السلام عليكم' },
  { t: [0.9, 2.16], b: 'مراسيل', u: 'Voyages رجعنا لكم' },
  { t: [2.18, 5.06], s: 'ببرنامج', b: 'عمرة', u: 'لموسم 2026/2027' },
  { t: [5.14, 6.7], s: 'ولخدمة أفضل', b: 'ضيوف الرحمن' },
  { t: [6.74, 8.05], s: 'جبنا لكم', b: 'عرضين', u: 'للعمرة' },
  { t: [8.12, 9.98], s: 'عمرة', b: 'VIP', u: 'وعمرة اقتصادي' },
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

// icons popping next to the speaker (screen-blended 3D gold renders)
const POPS = [
  { t: [2.7, 5.05], src: 'gold_calendar_icon_on_black', x: 790, y: 560, size: 420, label: '2026/2027' },
  { t: [7.2, 9.98], src: 'gold_crown_with_royal-blue_gems', x: 300, y: 560, size: 420, enter: 8.4 },
  { t: [7.2, 9.98], src: 'gold_coins_with_checkmark', x: 790, y: 560, size: 420, enter: 9.02 },
  { t: [12.28, 14.3], src: 'gold_kaaba_on_pedestal', x: 790, y: 520, size: 420, enter: 13.18 },
  { t: [22.4, 23.82], src: 'gold_heart_with_inner_glow', x: 800, y: 520, size: 340, enter: 22.76 },
  { t: [36.52, 38.55], src: 'gold_heart_with_inner_glow', x: 790, y: 520, size: 440, enter: 36.74 },
  { t: [38.58, 39.52], src: 'gold_calendar_icon_on_black', x: 790, y: 520, size: 400, enter: 39.04 },
];

const SFX = [
  ...TRANSITIONS.map((x) => ({ t: x.t - (x.fast ? 0.12 : 0.25), f: x.fast ? 'swish' : 'whoosh', v: x.fast ? 0.35 : 0.45 })),
  ...POPS.map((p) => ({ t: p.enter ?? p.t[0], f: 'pop', v: 0.55 })),
  { t: 0.05, f: 'shimmer', v: 0.35 },
  { t: 2.72, f: 'shimmer', v: 0.3 },
  { t: 8.4, f: 'shimmer', v: 0.3 },
  { t: 19.22, f: 'shimmer', v: 0.35 },
  { t: 25.9, f: 'tick', v: 0.6 }, { t: 26.7, f: 'tick', v: 0.6 }, { t: 27.6, f: 'tick', v: 0.6 }, { t: 28.5, f: 'tick', v: 0.6 },
  { t: 29.2, f: 'impact', v: 0.5 },
  { t: 38.35, f: 'riser', v: 0.35 },
  { t: 39.55, f: 'impact', v: 0.55 },
  { t: 40.6, f: 'pop', v: 0.5 }, { t: 41.2, f: 'pop', v: 0.5 }, { t: 41.8, f: 'shimmer', v: 0.35 },
];

// ---------------- helpers ----------------
const useT = (off = 0) => useCurrentFrame() / FPS + off;
const goldText = {
  background: `linear-gradient(180deg,#FFF1C4 0%,${GOLD} 38%,#9C6A12 62%,#FFD77A 100%)`,
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
};
const deepGlow = (k = 1) =>
  `drop-shadow(0 0 ${6 * k}px rgba(255,200,90,.55)) drop-shadow(0 0 ${22 * k}px rgba(232,169,58,.45)) drop-shadow(0 0 ${60 * k}px rgba(201,138,30,.35))`;

const transitionAmount = (t) => {
  let best = 0;
  for (const tr of TRANSITIONS) {
    const half = tr.fast ? 0.125 : 0.25;
    const d = Math.abs(t - tr.t);
    if (d < half) best = Math.max(best, 1 - d / half);
  }
  return best;
};

// ---------------- background (reference style: black texture + gold dashed curves) ----------------
const GoldLinesBg = () => {
  const t = useT();  // relative is fine for ambient motion
  return (
    <AbsoluteFill style={{ background: '#050505' }}>
      <Img src={a('golden_lines_on_dark_background')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 + 0.04 * Math.sin(t * 0.3)}) rotate(${t * 0.15}deg)` }} />
      <Img src={a('gold_dust_floating_in_void')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.35, transform: `translateY(${-t * 12}px) scale(1.2)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,.75) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------------- speaker ----------------
const Speaker = ({ seg, cutout }) => {
  const t = useT(seg.from);
  let z = 1.04;
  for (const [pt, amt] of seg.punch ?? []) {
    z *= interpolate(t, [pt - 0.12, pt + 0.18, pt + 1.6], [1, amt, amt * 0.985], clamp);
  }
  const video = (
    <OffthreadVideo
      src={staticFile(cutout ? 'intro_cut.webm' : 'raw.mp4')}
      muted transparent={cutout}
      startFrom={Math.round(seg.from * FPS)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'contrast(1.06) saturate(1.05) sepia(.08)' }}
    />
  );
  return (
    <AbsoluteFill>
      {cutout && <GoldLinesBg />}
      {cutout ? (
        <AbsoluteFill style={{ filter: 'drop-shadow(0 0 40px rgba(232,169,58,.35))' }}>{video}</AbsoluteFill>
      ) : video}
      {!cutout && (
        <>
          <Img src={a('golden_lines_on_dark_background')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.35 }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,.6) 100%)' }} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------------- full-screen gold 3D scene ----------------
const Card = ({ seg }) => {
  const t = useT(seg.from);
  const p = (t - seg.from) / (seg.to - seg.from);
  const [z0, z1] = seg.drift ?? [1, 1.1];
  const [x0, x1] = seg.pan ?? [0, 0];
  const z = interpolate(p, [0, 1], [z0, z1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const x = interpolate(p, [0, 1], [x0, x1], clamp);
  const style = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${x}px) scale(${z})` };
  return (
    <AbsoluteFill style={{ background: '#050505' }}>
      <Img src={a(seg.src)} style={style} />
      {/* bloom = deep glow on the hero object */}
      <Img src={a(seg.src)} style={{ ...style, mixBlendMode: 'screen', opacity: 0.45, filter: 'blur(28px) brightness(1.3)' }} />
      <Img src={a('gold_dust_floating_in_void')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.4, transform: `translateY(${-p * 80}px) scale(1.25)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(0,0,0,.7) 100%)' }} />
    </AbsoluteFill>
  );
};

const VideoScene = ({ seg }) => {
  const t = useT(seg.from);
  const p = (t - seg.from) / (seg.to - seg.from);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <OffthreadVideo src={staticFile(`a/${seg.src}.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + p * 0.08})`, filter: 'contrast(1.08) saturate(1.1)' }} />
      <Img src={a('golden_light_leak_on_black')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.25 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,.65) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------------- icon pop (motion graphic) ----------------
const Pop = ({ p }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const enter = p.enter ?? p.t[0];
  const s = spring({ frame: frame - enter * FPS, fps: FPS, config: { damping: 13, stiffness: 140 } });
  const out = interpolate(t, [p.t[1] - 0.2, p.t[1]], [1, 0], clamp);
  if (t < enter - 0.05) return null;
  const vel = Math.max(0, 1 - s) ; // motion blur while flying in
  const float = Math.sin((t - enter) * 2.2) * 10;
  return (
    <div style={{
      position: 'absolute', left: p.x - p.size / 2, top: p.y - p.size / 2 + float, width: p.size, height: p.size,
      transform: `scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * -25}deg) translateY(${(1 - s) * 120}px)`,
      opacity: Math.min(1, s * 1.6) * out, filter: `blur(${vel * 16 + (1 - out) * 10}px) ${deepGlow(0.8)}`,
    }}>
      <Img src={a(p.src)} style={{
        width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', borderRadius: '50%',
        WebkitMaskImage: 'radial-gradient(circle, #000 42%, transparent 68%)', maskImage: 'radial-gradient(circle, #000 42%, transparent 68%)',
      }} />
      {p.label && (
        <div style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 500, fontSize: 40, letterSpacing: 2, ...goldText }}>{p.label}</div>
      )}
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
  const small = { fontFamily: 'Cairo', fontWeight: 600, fontSize: 44, color: '#F4EEE2', textShadow: '0 2px 12px rgba(0,0,0,.8)' };
  const isLatin = /^[A-Za-z]/.test(c.b ?? '');
  const big = {
    fontFamily: isLatin ? 'Playfair Display' : 'Amiri', fontStyle: isLatin ? 'italic' : 'normal', fontWeight: 700,
    fontSize: (c.b ?? '').length > 8 ? 104 : 128, lineHeight: 1.15, ...goldText, filter: deepGlow(1), padding: '0 20px',
  };
  return (
    <div dir="rtl" style={{ position: 'absolute', left: 60, right: 60, top: 1240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
      {c.s && line(c.s, 0, small)}
      {c.b && <div style={{ filter: deepGlow(1) }}>{line(c.b, c.s ? 0.12 : 0, big)}</div>}
      {c.u && line(c.u, 0.24, { ...small, fontWeight: 400, fontSize: 40 })}
    </div>
  );
};

// ---------------- transition: gold/blue ribbon sweep from the logo + flash ----------------
const LogoTransition = () => {
  const t = useT();
  const tr = TRANSITIONS.find((x) => Math.abs(t - x.t) < (x.fast ? 0.125 : 0.25));
  if (!tr) return null;
  const half = tr.fast ? 0.125 : 0.25;
  const p = (t - (tr.t - half)) / (2 * half); // 0..1
  const flash = 1 - Math.abs(p - 0.5) * 2;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {!tr.fast && (
        <>
          <div style={{ position: 'absolute', left: -800, top: -400, width: 620, height: 3200, background: `linear-gradient(90deg, transparent, ${GOLD_D}, #FFE3A0, ${GOLD}, transparent)`, transform: `translateX(${interpolate(p, [0, 1], [-300, 2600])}px) rotate(28deg)`, filter: 'blur(6px)', opacity: 0.95 }} />
          <div style={{ position: 'absolute', left: -800, top: -400, width: 300, height: 3200, background: `linear-gradient(90deg, transparent, ${BLUE}, #3D66C9, transparent)`, transform: `translateX(${interpolate(p, [0, 1], [-650, 2300])}px) rotate(28deg)`, filter: 'blur(4px)', opacity: 0.9 }} />
        </>
      )}
      <Img src={a('golden_light_leak_on_black')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: flash * 0.9, transform: `scale(${1.2 + p * 0.4}) translateX(${(p - 0.5) * 300}px)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,226,160,${flash * 0.55}), transparent 60%)`, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

// ---------------- persistent logo, top-left ----------------
const Logo = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 6, fps: FPS, config: { damping: 18 } });
  const t = frame / FPS;
  if (t > 39.55) return null; // CTA shows the big logo
  return <Img src={staticFile('logo.png')} style={{ position: 'absolute', left: 44, top: 64, width: 250, opacity: s * 0.95, transform: `translateX(${(1 - s) * -40}px)`, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7)) drop-shadow(0 0 14px rgba(232,169,58,.35))' }} />;
};

// ---------------- CTA ----------------
const CTA = ({ seg }) => {
  const frame = useCurrentFrame() + Math.round(seg.from * FPS);
  const t = frame / FPS;
  const at = (d) => spring({ frame: frame - (seg.from + d) * FPS, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const item = (d, children, extra = {}) => {
    const s = at(d);
    return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`, filter: `blur(${(1 - s) * 10}px)`, ...extra }}>{children}</div>;
  };
  const pulse = 1 + 0.03 * Math.sin(t * 6);
  const iconMask = { mixBlendMode: 'screen', objectFit: 'cover', WebkitMaskImage: 'radial-gradient(circle, #000 40%, transparent 66%)', maskImage: 'radial-gradient(circle, #000 40%, transparent 66%)' };
  return (
    <AbsoluteFill>
      <Img src={a('dark_background_with_golden_bokeh')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + (t - seg.from) * 0.01})` }} />
      <GoldLinesOverlay />
      <AbsoluteFill dir="rtl" style={{ alignItems: 'center', paddingTop: 230, gap: 26, fontFamily: 'Cairo' }}>
        {item(0, <Img src={staticFile('logo.png')} style={{ width: 640, filter: deepGlow(0.7) }} />)}
        {item(0.25, <div style={{ fontSize: 50, color: '#F4EEE2', fontWeight: 600 }}>اتصل بنا</div>)}
        {item(0.4, <div style={{ fontFamily: 'Amiri', fontWeight: 700, fontSize: 150, lineHeight: 1, ...goldText, filter: deepGlow(1.1) }}>الآن</div>)}
        {item(1.05, (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 42px 18px 30px', borderRadius: 999, border: `3px solid ${GOLD}`, background: 'linear-gradient(180deg, rgba(31,63,143,.55), rgba(10,18,45,.75))', boxShadow: `0 0 40px rgba(232,169,58,.45), inset 0 0 20px rgba(232,169,58,.25)`, transform: `scale(${pulse})` }}>
            <Img src={a('gold_smartphone_receiver_icon')} style={{ width: 120, height: 120, ...iconMask }} />
            <div dir="ltr" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: 72, letterSpacing: 3, ...goldText }}>0795 718 786</div>
          </div>
        ))}
        {item(1.65, (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Img src={a('gold_location_pin_on_black')} style={{ width: 100, height: 100, ...iconMask }} />
            <div style={{ fontSize: 44, color: '#F4EEE2', fontWeight: 600 }}>الدرارية، الجزائر العاصمة</div>
          </div>
        ))}
        {item(2.25, <div dir="ltr" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: 46, color: '#F4EEE2', letterSpacing: 1 }}>@merassil_voyages</div>)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const GoldLinesOverlay = () => (
  <Img src={a('golden_lines_on_dark_background')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.6 }} />
);

// ---------------- stage with transition zoom/blur ----------------
const Stage = ({ children }) => {
  const t = useT();
  const k = transitionAmount(t);
  return <AbsoluteFill style={{ transform: `scale(${1 + k * 0.18})`, filter: k > 0.01 ? `blur(${k * 16}px) brightness(${1 + k * 0.5})` : undefined }}>{children}</AbsoluteFill>;
};

const Seg = ({ seg, overlayOnly }) => {
  if (overlayOnly && seg.kind !== 'cta' && seg.kind !== 'card') return null;
  switch (seg.kind) {
    case 'intro': return <Speaker seg={seg} cutout />;
    case 'speaker': return <Speaker seg={seg} />;
    case 'card': return <Card seg={seg} />;
    case 'video': return <VideoScene seg={seg} />;
    case 'cta': return <CTA seg={seg} />;
    default: return null;
  }
};

export const Ad = ({ layers }) => {
  const overlayOnly = layers === 'overlay';
  const f = (s) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: overlayOnly ? 'transparent' : '#000' }}>
      <Stage>
        {SEGMENTS.map((seg, i) => (
          <Sequence key={i} from={f(seg.from)} durationInFrames={f(seg.to) - f(seg.from)} layout="none">
            <Seg seg={seg} overlayOnly={overlayOnly} />
          </Sequence>
        ))}
      </Stage>
      {POPS.map((p, i) => <Pop key={i} p={p} />)}
      {!overlayOnly && <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.55) 66%, rgba(0,0,0,.55) 80%, transparent 92%)', pointerEvents: 'none' }} />}
      {CAPS.map((c, i) => (
        <Sequence key={i} from={f(c.t[0])} durationInFrames={f(c.t[1]) - f(c.t[0]) + 1} layout="none">
          <Caption c={c} />
        </Sequence>
      ))}
      <Logo />
      <LogoTransition />
      {!overlayOnly && <Audio src={staticFile('voice.mp3')} />}
      {!overlayOnly && SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, f(s.t))} layout="none">
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
