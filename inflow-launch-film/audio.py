"""Synthesises the 45 s soundtrack (pulse, restrained clicks, soft transitions). No samples, no narration.
Usage: python3 audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR = 48000, 45.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N); WL = np.zeros(N); WR = np.zeros(N)


def put(sig, t, gain=1.0, pan=0.0, wet=0.25):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l; R[i:i + len(sig)] += sig * r
    WL[i:i + len(sig)] += sig * l * wet; WR[i:i + len(sig)] += sig * r * wet


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)


def tone(f, dur, a=0.004, d=0.2, harm=(1,), glide=None):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = np.full(n, float(f)) if glide is None else f * (glide ** (t / dur))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return sum(h * np.sin(ph * (i + 1)) for i, h in enumerate(harm)) * env(n, a, d)


def noise(dur, lo, hi, a=0.002, d=0.03):
    n = int(dur * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR); X[(fq < lo) | (fq > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9) * env(n, a, d)


def swell(dur, lo, hi):
    n = int(dur * SR); return noise(dur, lo, hi, a=dur, d=10) * np.sin(np.pi * np.arange(n) / n) ** 2


note = lambda m: 440 * 2 ** ((m - 69) / 12)
click = lambda f=1900: tone(f, 0.05, d=0.012, harm=(1, .3)) + .5 * noise(0.05, 2500, 9000, d=0.006)
tick = lambda f=2600: tone(f, 0.04, d=0.008) * .8 + .35 * noise(0.04, 4000, 11000, d=0.004)
tap = lambda m: tone(note(m), 0.5, d=0.11, harm=(1, .35, .1))
bell = lambda m, d=0.9: tone(note(m), 3.0, d=d, harm=(1, .22, .0, .08))
def chime(t, ms=(79, 84), g=0.15):
    for i, m in enumerate(ms): put(tap(m), t + i * .09, g, wet=.7)
def whoosh(t, g=0.04, dur=0.5): put(swell(dur, 400, 5000), t - dur / 2, g, wet=.5)

# ---------------- music: 120 bpm, bar = 2 s, 20 bars then resolve ----------------
chords = [(45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
for b in range(20):
    root, ns = chords[b % 4]; t0 = b * 2.0
    lvl = 0.5 if b < 3 else 1.0
    for m in ns:
        n = int(2.6 * SR); t = np.arange(n) / SR
        pad = (np.sin(2 * np.pi * note(m) * t) + .3 * np.sin(2 * np.pi * note(m) * 2.001 * t))
        pad *= np.minimum(t / .5, 1) * np.minimum((2.6 - t) / .7, 1) * (1 + .12 * np.sin(2 * np.pi * .8 * t))
        put(pad, t0, 0.030 * lvl, pan=(m % 5 - 2) / 4, wet=.6)
    put(tone(note(root), 2.0, a=.02, d=1.4, harm=(1, .25)), t0, 0.16 * lvl, wet=.05)
    for q in range(4): put(tone(62, 0.3, a=.002, d=.075, glide=.55), t0 + q * .5, 0.42 * lvl, wet=.02)
    if b >= 3:
        for e in range(8):
            put(tone(note(ns[(e * 3 + b) % 4] + 12), 0.4, d=.09, harm=(1, .3)), t0 + e * .25, 0.045 if b < 10 else 0.06, pan=.5 if e % 2 else -.5, wet=.7)
            if e % 2: put(noise(0.04, 6000, 12000, d=.008), t0 + e * .25, 0.022, wet=.1)
for q in range(2): put(tone(62, 0.3, a=.002, d=.075, glide=.55), 40 + q * .5, 0.42, wet=.02)
E = 41.1
for i, m in enumerate([60, 64, 67, 72, 76]): put(bell(m, d=1.1), E + i * .11, 0.10, pan=(i - 2) / 3, wet=.9)
put(tone(note(36), 3.6, a=.02, d=1.4, harm=(1, .2)), E, 0.22, wet=.05)
for m in [48, 55, 60, 64]:
    n = int(3.8 * SR); t = np.arange(n) / SR
    put(np.sin(2 * np.pi * note(m) * t) * np.minimum(t / .3, 1) * np.exp(-t / 1.4), E, 0.035, wet=.6)

# ---------------- sound design, locked to picture ----------------
put(tap(72), 0.42, 0.10, wet=.7); whoosh(1.25, .035, .6)                    # title rise, gradient wipe
for t in np.arange(1.3, 2.4, .11): put(tick(rng.uniform(2600, 3600)), t, 0.025, pan=rng.uniform(-.8, .8), wet=.5)
whoosh(2.85, .04)
for t, m in [(3.0, 60), (3.85, 55), (4.6, 67)]: put(tone(note(m - 12), .35, d=.09, harm=(1, .5, .2)), t, 0.3, wet=.2)  # three cut-ins
for a, b, n in [(3.05, 3.5, 12), (3.9, 4.1, 5), (4.68, 5.05, 8)]:
    for t in np.sort(rng.uniform(a, b, n)): put(tick(rng.uniform(2200, 3400)), t, 0.04, wet=.1)
S = 5.7                                                                      # terminal
put(tap(84), S, 0.10, wet=.7)
for t in np.sort(rng.uniform(S + .75, S + 2.05, 30)): put(tick(rng.uniform(2200, 3400)), t, 0.045, pan=-.3, wet=.1)
for t in np.sort(rng.uniform(S + 2.35, S + 2.9, 12)): put(tick(rng.uniform(3000, 3800)), t, 0.03, pan=.3, wet=.1)
whoosh(S + 3.3, .045, .8)
for t in np.arange(S + 3.8, S + 4.6, .07): put(tick(rng.uniform(2400, 3800)), t, 0.03, pan=rng.uniform(-.8, .8), wet=.5)
for i, t in enumerate([S + 4.0, S + 4.25, S + 4.45]): put(tap(72 + i * 4), t, 0.11, wet=.7)
whoosh(S + 5.25, .045, .7)
S = 11.3                                                                     # scan
put(tone(520, 2.0, a=.3, d=3, glide=1.5) * .5, S + 1.25, 0.03, wet=.6)
for r in range(3):
    for c in range(3): put(tick(2300 + c * 200), S + 1.25 + (84 + r * 120) / 200 + c * .05, 0.10, pan=(c - 1) * .6, wet=.3)
for c in range(3): put(tap(76 + c * 3), S + 3.35 + c * .16, 0.13, pan=(c - 1) * .5, wet=.7)
whoosh(S + 4.6, .04)
S = 16.1                                                                     # checklist
for i in range(13):
    t = .15 + (8 + 96 * i) / 289.7
    if t < 3.9: put(tick(2500), S + t, 0.07, pan=.5, wet=.3)
whoosh(S + 4.0, .04)
S0 = 20.3; SEG = 3.36                                                        # wheel
for i in range(4): whoosh(S0 + (i + 1) * SEG - .25, .05, .6)
d = S0 + .75
for t in (.95, 1.1, 1.25): put(click(2300), d + t, 0.08)
whoosh(d + 1.5, .03, .45); chime(d + 1.9, (79,), .13)
d = S0 + SEG
for i in range(6): put(tap(67 + [0, 2, 4, 7, 9, 12][i]), d + .55 + i * .36 + .26, 0.10, pan=(i % 3 - 1) * .5, wet=.7)
d = S0 + 2 * SEG
for i, t in enumerate((.75, 1.05, 1.35, 1.65)): put(tick(2300 + i * 150), d + t, 0.11, wet=.3)
chime(d + 1.95)
d = S0 + 3 * SEG
put(click(1700), d + .95, 0.13)
put(tone(330, 0.8, a=.1, d=.5, glide=2.4) * (1 + .5 * np.sin(2 * np.pi * 14 * np.arange(int(.8 * SR)) / SR)), d + 1.3, 0.045, wet=.5)
chime(d + 2.1, (79, 84), .16)
d = S0 + 4 * SEG
for i in range(3): put(tap(72 + i * 4), d + 1.45 + i * .3, 0.10, wet=.7)
whoosh(S0 + 16.6, .045)
S = 37.1                                                                     # icons + toggle
whoosh(S + .6, .05, 1.1); whoosh(S + 1.55, .05, .8)
for i in range(11): put(tick(2400 + i * 90), S + 2.0 + abs(i - 5) * .07 + (.01 if i > 5 else 0), 0.05, pan=(i - 5) / 6, wet=.4)
put(click(1500), S + 3.0, 0.16); chime(S + 3.12, (76, 84), .14)
whoosh(S + 3.85, .045)
for t in np.sort(rng.uniform(E + 1.35, E + 2.3, 26)): put(tick(rng.uniform(2200, 3400)), t, 0.04, wet=.1)   # CTA typing

# ---------------- reverb, master ----------------
n_ir = int(1.6 * SR); tt = np.arange(n_ir) / SR
def verb(x, seed):
    ir = np.random.default_rng(seed).standard_normal(n_ir) * np.exp(-tt / .38); ir[: int(.012 * SR)] = 0
    m = 1 << int(np.ceil(np.log2(N + n_ir)))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:N] * .02
L += verb(WL, 1); R += verb(WR, 2)
out = np.tanh(np.stack([L, R], 1) * 1.3)
out *= 0.71 / np.abs(out).max()
fade = np.ones(N); k = int(.02 * SR); fade[:k] = np.linspace(0, 1, k)
k = int(.6 * SR); fade[-k:] = np.linspace(1, 0, k) ** 2
out *= fade[:, None]
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "soundtrack.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
print("wrote", N / SR, "s")
