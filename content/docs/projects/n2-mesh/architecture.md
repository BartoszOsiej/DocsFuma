---
description: Documentation for 🧱 Meshcore — Architecture.
keywords:
- Bartosz Osiej Docs
- architecture
- networking
- browser
- AST
- documentation
title: 🧱 Meshcore — Architecture
---
# 🧱 Meshcore — Architecture

## Layers

| Layer | Technology | Role |
|---|---|---|
| **P2P transport** | WebRTC data channels (native) | Direct peer-to-peer message delivery |
| **Signaling** | Public MQTT broker (per-room topic) | Presence + SDP offer/answer/ICE exchange |
| **Message channel** | WebRTC data channel (`n2`) | Sending messages directly between browsers |
| **Relay fallback** | Own MQTT 3.1.1 client (WSS) | Delivering messages when WebRTC cannot connect (CGNAT / mobile networks) |
| **Local bridge** | `BroadcastChannel` | Tabs of the same browser (WebRTC loopback blocked) |

## Key technical decisions

### 1. Room = signaling topic

Every peer subscribes to `n2mesh/{room}` on a public MQTT broker and
announces its presence there. Peers that see each other's presence establish
a WebRTC connection. Changing the room = new topic = new peer group.

### 2. Glare-free offer selection

Two peers may see each other's presence at the same instant, and both must
not send offers (the WebRTC "glare" race). The peer with the **lexicographically
smaller id** sends the offer; the other side waits for it:

```js
if (state.pid < p.pid) {
  dial(p.pid); // we are the offerer
}
```

Each peer id is random per session, so this always picks exactly one offerer.

### 3. Signaling messages over MQTT

Signaling rides the same per-room topic as everything else. Message kinds:

```js
{ type: 'presence', pid, nick }                    // peer discovery
{ type: 'signal', from, to, data: { sdp } }        // offer / answer
{ type: 'signal', from, to, data: { candidate } }  // ICE candidate
{ u, t, ts, mid }                                  // chat message
```

The `to` field addresses a specific peer; others ignore it. ICE candidates
arriving before the remote description are buffered per connection.

### 4. Relay fallback (MQTT) — why it exists

Pure P2P in the browser **does not connect on mobile networks**: carriers
use CGNAT and reject hole-punching, and the free public TURN servers that
used to bridge it are dead in 2026 or require an account (Cloudflare TURN
needs API credentials).

The solution: every message is also **published in parallel** to the topic
`n2mesh/{room}` on a public MQTT broker over WSS. The MQTT client is an
**own, dependency-free MQTT 3.1.1 implementation** (~100 lines):

```js
function mqttConnectPkt(clientId) { /* CONNECT: MQTT, v4, clean, keepalive 60 */ }
function mqttSubPkt(topic)        { /* SUBSCRIBE qos 0 */ }
function mqttPubPkt(topic, p)     { /* PUBLISH qos 0 */ }
function mqttUnsubPkt(topic)      { /* UNSUBSCRIBE on room change */ }
```

- **Room isolation:** every tab subscribes to the **exact topic of its room**
  (no wildcards) — traffic from other rooms never reaches it.
- **Deduplication by ID:** every message has a unique `mid`; a `Map`
  remembers recent IDs for 30 s, so a message received over P2P *and* relay
  *and* the local bridge is displayed **once**.
- **Offline queueing:** messages sent before the broker connection lands in
  `relay.queue` (with the room remembered) and are flushed after
  CONNACK→SUBACK.
- **Brokers:** `wss://broker.hivemq.com:8884` (verified end-to-end), backup
  `wss://broker.emqx.io:8084`, failover every 3 attempts.
- **Keepalive:** PINGREQ every 30 s, reconnect with backoff (1 s → 15 s).

The status shows which path the connection uses: `P2P`, `P2P + relay`,
`relay mode` (phone on CGNAT), `connecting…`.

### 5. Local bridge (BroadcastChannel)

Two tabs of **the same browser** cannot connect via WebRTC (browsers block
WebRTC loopback). The `BroadcastChannel` bridge connects them locally: tabs
of the same browser exchange `hello`/`msg` directly, while different
browsers/devices go through WebRTC data channels and/or the relay.

### 6. Why WebTorrent was removed

The original version found peers through public WebTorrent WebSocket trackers
(`tracker.webtorrent.dev`, `tracker.openwebtorrent.com`) and carried messages
over the BitTorrent extended protocol. Live testing (August 2026) showed the
trackers **accept announces and register peers but never relay WebRTC offers**
between them — two clients in the same swarm (`complete=2`) received zero
offers. The browser build of WebTorrent can only use WebSocket trackers (no
UDP/DHT in the browser), so peers could never discover each other and P2P was
dead. Replacing it with native WebRTC + MQTT signaling keeps the app fully
serverless, zero-dependency, and working today.

## Files

| File | Contents |
|---|---|
| `index.html` | Single-page shell |
| `app.js` | Networking: WebRTC P2P + MQTT signaling/relay + local bridge |
| `style.css` | Dark aurora theme |
| `.github/workflows/deploy.yml` | Deploy to GitHub Pages |

## Data flow

```
sender:  JSON({u, t, ts, mid}) ──► dc.send(payload)          (P2P data channel)
                              ──► mqttPubPkt('n2mesh/room', p) (relay)
                                              │
      peer receives via the data channel OR via the MQTT broker
                                              ▼
receiver:  handlePayload(bytes) ── dedup by mid ──► addMessage(nick, text)

discovery: presence on 'n2mesh/room' ──► dial() ──► SDP/ICE via relay ──► data channel open
```

## Limitations

- **No history** — when you leave the room, the peer group is gone (the price
  of having no server).
- **Both peers must be online simultaneously** — the relay does not store
  messages (QoS 0, no retention).
- **Relay mode = messages pass through a public broker** — a deliberate
  trade-off so the chat works on networks where P2P is impossible (CGNAT).
  P2P mode stays fully peer-to-peer.

## Repo

[BartoszOsiej/Meshcore](https://github.com/BartoszOsiej/Meshcore) ·
[Live](https://bartoszosiej.github.io/n2-mesh/)
