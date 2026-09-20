---
description: pcap-based traffic analyzer — live capture or offline parsing with per-IP/per-port statistics.
keywords:
- Bartosz Osiej Docs
- Bash
- documentation
title: PacketEye
---
# PacketEye

pcap-based traffic analyzer — live capture or offline parsing with
per-IP/per-port statistics.

## Overview

PacketEye reads packet captures (live or from a `.pcap` file) and produces a
traffic summary: packet/byte totals, protocol mix, TCP handshake counts,
top talkers, and top ports. It performs a minimal hand-rolled
Ethernet → IPv4 → TCP/UDP/ICMP parse — enough for solid statistics without
heavy dependencies.

## Usage

```
packeteye live <iface> [count]   capture live (count=0 for infinite)
packeteye file <dump.pcap>       parse offline capture

EXAMPLES:
  sudo packeteye live eth0
  packeteye file capture.pcap
  sudo packeteye live wlan0 1000
```

> **Note:** live capture requires root/CAP_NET_RAW (or the equivalent
> capabilities for the interface).

## What it reports

| Statistic | Detail |
|---|---|
| Packets / bytes | Total volume |
| Protocol mix | TCP / UDP / ICMP / other counts |
| TCP handshakes | SYN and SYN-ACK counts |
| Top talkers | Top 10 IPs by packet count |
| Top ports | Top 15 ports by packet count |

## Packet parsing

The analyzer understands:

- **Ethernet** — 14-byte header, EtherType dispatch (`0x0800` IPv4;
  `0x86dd` IPv6 is skipped for detailed parsing)
- **IPv4** — IHL-based header parsing, protocol field, source/dest addresses
- **TCP** — source/dest ports, SYN (`0x02`) and ACK (`0x10`) flags
- **UDP** — source/dest ports
- **ICMP** — counted only

All parsing is bounds-checked; truncated packets are counted but skipped.

## Example output

```
[*] PacketEye 1.0.0 | listening on eth0 (promisc)
[*] Ctrl+C to stop

=== report: live eth0 (1000 pkts) ===
packets: 1000 | bytes: 742133
protocols: tcp=812 udp=140 icmp=44 other=4
tcp handshakes: syn=23 synack=21

top talkers (by packets):
     192.168.1.10          512
      10.0.0.1             240
        ...

top ports (by ports):
  443        621
  80         132
  53          78
```

## Offline analysis

```bash
# Capture with tcpdump, analyze offline
sudo tcpdump -i eth0 -w capture.pcap
packeteye file capture.pcap
```

## Implementation notes

- `pcap::Capture::from_device` with promiscuous mode, 65535 snaplen,
  200 ms timeout
- Live loop treats `TimeoutExpired` as "keep waiting"
- Statistics use `HashMap<Ipv4Addr, u64>` and `HashMap<u16, u64>`, sorted
  descending before printing
- Graceful error messages for missing interfaces or unreadable files
