# Tic Tac Toe (WebRTC Demo) 🎮

A standalone peer-to-peer demo available at `/tictactoe` ( `https://stuartneivandt.com/tictactoe`).

It supports:
- Local hot-seat play (two people at same screen)
- Remote play over an encrypted WebRTC data channel

## Remote Play
Because there’s no signaling server, players exchange a short **Game Code** out-of-band (chat, email, etc.). The Game Code encodes the WebRTC offer/answer in a compressed, base64 form (with a small prefix).

### Host Flow
1. Visit `/tictactoe` and click **Host**.
2. Your Game Code is auto-copied (toast confirms). Share it with the other player.
3. Paste their Game Code into the box → Apply.

### Join Flow
1. Visit `/tictactoe` and click **Join**.
2. Paste the Host’s Game Code → Apply.
3. Your Game Code (answer) auto-copies; send it back to the Host.

Once connected, moves sync instantly. For each new game, the X player is chosen randomly (host decides and both sides update). Pressing Reset requests a new game; only the host actually initiates the randomization.

## Privacy Note
Sharing a Game Code may reveal some information about your network connection. Only exchange codes with trusted peers.

## Caveats
- Some restrictive NAT / corporate networks may block direct P2P (only a public STUN server is used; no TURN fallback).
- If connection fails, refresh both sides and repeat the exchange (codes aren’t reusable after reload).