"""Synthesises the 30 s soundtrack: instrumental pulse, restrained clicks, soft transitions.
No samples, no narration. Usage: python3 audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR, FPS = 48000, 30.0, 30
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)          # dry bus
WL = np.zeros(N); WR = np.zeros(N)        # reverb send
ft = lambda frame: frame / FPS


def put(sig, t, gain=1.0, pan=0.0, wet=0.25):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l; R[i:i + len(sig)] += sig * r
    WL[i:i + len(sig)] += sig * l * wet; WR[i:i + len(sig)] += sig * r * wet


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)


def tone(f, dur, a=0.004, d=0.2, harm=(1, 0.0), glide=None):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = np.full(n, f) if glide is None else f * (glide ** (t / dur))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(h * np.sin(ph * (i + 1)) for i, h in enumerate(harm))
    return s * env(n, a, d)


def noise(dur, lo, hi, a=0.002, d=0.03):
    n = int(dur * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR)
    X[(fq < lo) | (fq > hi)] = 0
    y = np.fft.irfft(X, n); y /= np.abs(y).max() + 1e-9
    return y * env(n, a, d)


def swell(dur, lo, hi):
    n = int(dur * SR); y = noise(dur, lo, hi, a=dur, d=10)
    return y * np.sin(np.pi * np.arange(n) / n) ** 2


note = lambda m: 440 * 2 ** ((m - 69) / 12)
click = lambda f=1900: tone(f, 0.05, d=0.012, harm=(1, .3)) + .5 * noise(0.05, 2500, 9000, d=0.006)
tick = lambda f=2600: tone(f, 0.04, d=0.008) * .8 + .35 * noise(0.04, 4000, 11000, d=0.004)
tap = lambda m: tone(note(m), 0.5, d=0.11, harm=(1, .35, .1))
bell = lambda m, d=0.9: tone(note(m), 3.0, d=d, harm=(1, .22, .0, .08))

# ---------------- music: 120 bpm, bar = 2 s ----------------
BEAT = 0.5
chords = [(45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
bars = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 1]          # 13 bars = 26 s, then resolve on C
for b, ci in enumerate(bars):
    root, ns = chords[ci]; t0 = b * 2.0
    lvl = 0.55 if b < 2 else 1.0
    for m in ns:                                            # soft pad
        n = int(2.6 * SR); t = np.arange(n) / SR
        pad = np.sin(2 * np.pi * note(m) * t) + .3 * np.sin(2 * np.pi * note(m) * 2.001 * t)
        pad *= np.minimum(t / .5, 1) * np.minimum((2.6 - t) / .7, 1) * (1 + .12 * np.sin(2 * np.pi * .8 * t))
        put(pad, t0, 0.030 * lvl, pan=(m % 5 - 2) / 4, wet=.6)
    put(tone(note(root), 2.0, a=.02, d=1.4, harm=(1, .25)), t0, 0.16 * lvl, wet=.05)   # bass
    for q in range(4):                                      # pulse
        put(tone(62, 0.3, a=.002, d=.075, glide=.55), t0 + q * BEAT, 0.42 * lvl, wet=.02)
    if b >= 2:                                              # 8th-note pluck + off-beat hat
        for e in range(8):
            m = ns[(e * 3 + b) % 4] + 12
            put(tone(note(m), 0.4, d=.09, harm=(1, .3)), t0 + e * .25, 0.045, pan=.5 if e % 2 else -.5, wet=.7)
            if e % 2: put(noise(0.04, 6000, 12000, d=.008), t0 + e * .25, 0.022, wet=.1)

# brand resolve at 26 s: C major, music ends cleanly by 30 s
for i, m in enumerate([60, 64, 67, 72, 76]):
    put(bell(m, d=1.0), 26.0 + i * .11, 0.10, pan=(i - 2) / 3, wet=.9)
put(tone(note(36), 3.2, a=.02, d=1.3, harm=(1, .2)), 26.0, 0.22, wet=.05)
for m in [48, 55, 60, 64]:
    n = int(3.6 * SR); t = np.arange(n) / SR
    put(np.sin(2 * np.pi * note(m) * t) * np.minimum(t / .3, 1) * np.exp(-t / 1.3), 26.0, 0.035, wet=.6)

# ---------------- sound design, locked to frames ----------------
for t in np.sort(rng.uniform(ft(29), ft(45), 16)):          # typing texture
    put(tick(rng.uniform(2200, 3400)), t, 0.045, pan=-.5, wet=.1)
put(tone(170, 0.2, d=.05, harm=(1, .4)), ft(66), 0.30, wet=.1)            # muted stop
for fr, m in [(105, 72), (111, 76), (117, 79)]: put(tap(m), ft(fr), 0.16, wet=.6)   # three ascending taps
put(click(), ft(152), 0.12)                                                # search
for fr in (180, 188, 196): put(tick(2000), ft(fr), 0.10, wet=.3)           # card placement
for fr in (207, 215): put(click(2300), ft(fr), 0.09)                       # filter chips
put(tap(79), ft(238), 0.12, wet=.6)                                        # selection
put(click(1700), ft(324), 0.16)                                            # approval click
for fr, m in [(384, 76), (387, 81)]: put(tap(m), ft(fr), 0.15, wet=.7)     # confirmation tone
for fr in (446, 455): put(tick(2400), ft(fr), 0.12, wet=.3)                # two policy ticks
put(tone(330, 0.8, a=.1, d=.5, glide=2.4) * (1 + .5 * np.sin(2 * np.pi * 14 * np.arange(int(.8 * SR)) / SR)), ft(540), 0.05, wet=.5)
for fr, m in [(566, 79), (569, 84)]: put(tap(m), ft(fr), 0.16, wet=.7)     # payment confirmation
for m in (60, 64, 67, 72): put(bell(m, d=.7), ft(656), 0.07, wet=.9)       # warm completion note
for fr in (718, 730): put(click(1500), ft(fr), 0.12, wet=.3)               # two placement clicks
put(tick(2200), ft(762), 0.08, wet=.3)
for fr in (86, 148, 264, 388, 478, 596, 688, 776):                         # soft transitions
    put(swell(0.42, 500, 5000), ft(fr) - 0.1, 0.035, wet=.5)

# ---------------- reverb, master ----------------
n_ir = int(1.6 * SR); tt = np.arange(n_ir) / SR
def verb(x, seed):
    ir = np.random.default_rng(seed).standard_normal(n_ir) * np.exp(-tt / .38); ir[: int(.012 * SR)] = 0
    m = 1 << int(np.ceil(np.log2(N + n_ir)))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:N] * .02
L += verb(WL, 1); R += verb(WR, 2)
out = np.stack([L, R], 1)
out = np.tanh(out * 1.3)
out *= 0.71 / np.abs(out).max()                             # -3 dBFS peak
fade = np.ones(N); k = int(.02 * SR); fade[:k] = np.linspace(0, 1, k)
k = int(.5 * SR); fade[-k:] = np.linspace(1, 0, k) ** 2
out *= fade[:, None]
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "soundtrack.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
print("wrote", N / SR, "s")
