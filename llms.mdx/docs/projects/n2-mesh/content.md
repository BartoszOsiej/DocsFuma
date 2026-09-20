# 💬 Meshcore — P2P Chat (/docs/projects/n2-mesh)



# 💬 Meshcore — P2P Chat [#-meshcore--p2p-chat]

<a class="tests-cta" href="./tests">🧪 View animated test results — 22/22 →</a>

**Serverless peer-to-peer chat with an automatic relay fallback.** It runs on
static hosting (GitHub Pages) — zero servers, zero databases, zero accounts.

> **Try it now:** [🚀 Open Meshcore](https://bartoszosiej.github.io/Meshcore/)
> (opens in a new tab)

## How it works [#how-it-works]

```
  ┌─────────────┐   WebRTC data channel   ┌─────────────┐
  │  Peer A     │◄───────────────────────►│  Peer B     │
  │ (your tab)  │    (direct, P2P)        │ (their tab) │
  └──────┬──────┘                         └──────┬──────┘
         │    SDP offer/answer/ICE via          │
         │    public MQTT topic (signaling only) │
         ▼                                       ▼
   ┌─────────────────────────────────────────────────┐
   │   Public MQTT broker (per-room topic)           │
   │   presence + signaling + fallback for messages  │
   └─────────────────────────────────────────────────┘
```

### Layer 1 — P2P (WebRTC) [#layer-1--p2p-webrtc]

1. **Peers announce their presence** on a per-room MQTT topic (public broker,
   no account — the same way messengers discover each other).
2. When two peers see each other, they exchange **WebRTC offer/answer/ICE
   candidates** through that topic (the classic signaling-server pattern used
   by PeerJS & co.). The broker only *introduces* peers — it never sees
   message payloads.
3. Once connected, chat messages travel over the **WebRTC data channel**
   directly between browsers — real peer-to-peer.

### Layer 2 — Relay (automatic fallback) [#layer-2--relay-automatic-fallback]

Pure browser P2P **cannot connect on mobile networks**: carriers use CGNAT
and block NAT hole-punching, and the free public TURN servers that used to
bridge it are dead or paid (2026). That is why every message is also
**published in parallel** to a per-room topic on a public MQTT broker
(WSS, no account). Every receiver **deduplicates by message ID**, so:

* peers that can connect P2P → messages travel directly over the WebRTC data
  channel,
* devices that cannot (phones on LTE/5G) → exchange messages via the relay.

**P2P first, relay as a fallback** — the same pattern real messengers use.

> **Why not WebTorrent trackers?** The original build found peers through
> public WebTorrent WebSocket trackers (`tracker.webtorrent.dev`,
> `tracker.openwebtorrent.com`). Those trackers now accept announces and see
> the swarm, but **no longer relay WebRTC offers** between peers (verified
> live: two peers registered in the same swarm, zero offers ever returned).
> Since the browser build of WebTorrent can only use WebSocket trackers (no
> UDP/DHT in the browser), peers could never find each other — so signaling
> moved to the MQTT relay.

## Features [#features]

* 🔗 **Rooms** — the same room name = the same signaling topic = the same
  peer group
* 📡 **Relay fallback** — a dependency-free MQTT 3.1.1 client (\~100 lines, no
  libraries), publishing to `n2mesh/{room}`, room isolation by exact topic
* 🔀 **Deduplication by ID** — a message received over P2P *and* relay *and*
  the local bridge is displayed once
* 💬 **True P2P messages** — over WebRTC data channels, with MQTT fallback
* 🏷️ Nicknames, peer counter, connection status (P2P / P2P+relay / relay)
* 🔗 Shareable room links (`#/room-name`)
* 🌙 Dark, keyboard-accessible interface, zero dependencies (no CDN, no build)
* 🖥️ **Local bridge** — tabs of the same browser cannot connect via WebRTC
  (browsers block WebRTC loopback), so a `BroadcastChannel` bridge connects
  them locally

## How to use it [#how-to-use-it]

1. Open [Meshcore](https://bartoszosiej.github.io/Meshcore/) on two devices
   (or two tabs of one browser).
2. Set **the same room** on both sides (default: `lobby`).
3. Pick a nickname and send messages — on a desktop they travel P2P, on a
   phone automatically via the relay. Both cases work from the same link.

> ⚠️ This is a demo-grade mesh: scrollback is cached per room in your
> browser (last 100 messages), but there is no server-side history —
> messages sent while you are offline are lost (no broker-side queueing).

## Run locally [#run-locally]

```bash
git clone https://github.com/BartoszOsiej/Meshcore.git
cd n2-mesh
python3 -m http.server 8080
# open http://localhost:8080
```

## Security [#security]

* **P2P mode:** messages travel exclusively peer-to-peer; the MQTT broker
  only performs signaling and never receives content.
* **Relay mode:** messages pass through a public MQTT broker — a fallback
  for networks where P2P is impossible. Rooms are isolated (each subscriber
  only gets its own topic).
* Everything is plain JavaScript (zero dependencies — no CDN), no tracking,
  no data stored.

## More [#more]

* [Architecture & technical details](/docs/projects/n2-mesh/architecture)
* [Repo: BartoszOsiej/Meshcore](https://github.com/BartoszOsiej/Meshcore)
