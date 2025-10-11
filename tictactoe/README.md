# Tic Tac Toe (WebRTC Demo) 🎮

A tiny peer‑to‑peer demo at https://stuartneivandt.com/tictactoe.

- 👥 Local hot‑seat (two people, one screen)
- 🌐🔐 Remote play over an encrypted WebRTC data channel (no server relay)

## Remote Play
There is **no signaling server**. Instead you exchange a short text blob ("Game Code") out‑of‑band (chat, email, etc.). That blob is a compressed + base64 encoded WebRTC offer or answer with a simple prefix. After both sides apply each other's code, the direct peer connection is established.

1. Host clicks **Host** → gets a link → sends it.
2. Joiner opens link → gets an **Accept Code** → sends it back.
3. Host pastes Accept Code → **Apply Accept Code** → game syncs.

### Host Steps
1. Open `/tictactoe` and press **Host**.
2. Wait a moment while the offer is gathered.
3. You’ll then get either:
   - Mobile / share‑capable: **Share Host Link** button lights up (toast: “Host link ready”). Tap to use your device share sheet.
   - Desktop / no share sheet: The join link auto‑copies (toast confirms). Paste it to your friend.
4. Receive the **Accept Code** from the joiner, paste it, click **Apply Accept Code**.
5. Board appears on both sides; play begins.

### Joiner Steps
1. Open the link the host sent you. (If you navigated manually, click **Join**, paste the host code, then **Apply**.)
2. Your browser generates an **Accept Code**.
3. When ready you’ll get either:
   - Mobile / share‑capable: **Share Accept Code** button (uses native share; fallback copies).
   - Desktop: **Copy Accept Code** button; click to copy.
4. Send the Accept Code to the host. Connection finishes once they apply it.

## Troubleshooting
| Problem | Try |
|---------|-----|
| Connection never completes | Refresh both pages and repeat the exchange (codes are single‑use). |
| Buttons never enable | Give it a few seconds; ICE gathering may still be happening. |
| Copy/share fails | Manually select the textarea contents and copy. |
| One side stops receiving moves | Refresh both sides; start a fresh exchange. |

## Limitations & Caveats
- Only a public STUN server; **no TURN**. Some strict NAT / corporate networks may block P2P.
- Web Share detection is heuristic (coarse pointer + `navigator.share`). Desktop browsers often fall back to plain copy.
- Codes/links cannot be reused after a page reload.

## Privacy
Game Codes include metadata that can reveal limited network info (e.g., ICE candidates). Share only with people you trust. 🤝