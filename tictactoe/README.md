# Tic Tac Toe (WebRTC Demo) 🎮

A standalone peer-to-peer demo available at `/tictactoe` ( `https://stuartneivandt.com/tictactoe`).

It supports:
- Local hot-seat play (two people at same screen)
- Remote play over an encrypted WebRTC data channel

## Remote Play
Because there’s no signaling server, players exchange a short **Game Code** out-of-band (chat, email, etc.). The Game Code encodes the WebRTC offer/answer in a compressed, base64 form (with a small prefix).

### Host Flow
1. Visit `/tictactoe` and click **Host**.
2. When the connection offer finishes gathering, one of two things happens:
	- **Mobile / Web Share capable**: A disabled "Share Host Link" button becomes enabled and a toast says *"Host link ready"*. Tap it to open your device share sheet (SMS, chat apps, etc.).
	- **Desktop / No Web Share**: The join link (URL containing the embedded offer) is auto‑copied to your clipboard (toast confirms). Paste/send it to the other player.
3. After the joiner returns their **Accept Code** (answer), paste it into the textarea and click **Apply Accept Code**.

### Join Flow
1. Open the host's shared link. (If you navigated manually, click **Join** and paste the Host’s code, then **Apply**.)
2. Your side generates an **Accept Code** (answer). When it’s ready:
	- **Mobile / Web Share capable**: A **Share Accept Code** button enables. Tap to use the native share sheet. If sharing fails (other than cancel), it falls back to copying.
	- **Desktop / No Web Share**: A **Copy Accept Code** button enables. Click it to copy and send to the host.
3. The host applies your Accept Code to finalize the peer connection.

Once connected, moves sync instantly. For each new game, the X player is chosen randomly (host sends assignment; both sides update). Pressing Reset as a joiner sends a request; only the host triggers the randomization broadcast.

## Privacy Note
Sharing a Game Code may reveal some information about your network connection. Only exchange codes with trusted peers.

## Caveats
- Some restrictive NAT / corporate networks may block direct P2P (only a public STUN server is used; no TURN fallback).
- If connection fails, refresh both sides and repeat the exchange (codes/links aren’t reusable after reload).
- Web Share availability is a heuristic (coarse pointer + `navigator.share`). Desktop browsers may still show classic copy behavior even if they technically expose the API.