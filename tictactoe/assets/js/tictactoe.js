/*
 * tictactoe.js
 * Simple 2‑player Tic‑Tac‑Toe over a peer‑to‑peer WebRTC data channel.
 * No external dependencies, no signaling server: users exchange a short "code"
 * (offer/answer) manually via an auto‑copied link (host) + accept code (joiner).
 *
 * Major pieces:
 *  - Game state + rendering (pure DOM buttons)
 *  - Minimal WebRTC setup (host creates offer; joiner applies, produces answer)
 *  - Manual signaling using compressed base64 payloads prefixed with G0/G1
 *  - Lightweight toast notifications for UX feedback
 *
 * Cleaned: removed unused vars, clarified logic, added comments, and made
 * move messages explicit (include symbol) to reduce desynchronization risk.
 */
(function () {
    'use strict';

    // Runtime connection object: { pc: RTCPeerConnection, dc: RTCDataChannel, role: 'host'|'join' }
    let rtc = null;
    // Game model (initialized in init())
    let game = null;
    // Prevent multiple toasts / clipboard writes when ICE trickles
    let hostLinkCopied = false;

    function $(id) { return document.getElementById(id); }
    function q(sel) { return document.querySelector(sel); }

    function init() {
        const boardEl = $('ttt-board');
        const statusEl = $('ttt-status');
        const peerStateEl = $('ttt-peer-state');
        const hostBtn = $('ttt-host');
        const joinBtn = $('ttt-join'); // removed from DOM but referenced defensively
        const resetBtn = $('ttt-reset');
        const signalContainer = $('signal-container');

        game = {
            board: Array(9).fill(null),
            turn: 'X',
            over: false,
            mySymbol: 'X',
            isMyTurn() { return !rtc || this.turn === this.mySymbol; }
        };

        function setStatus(msg) { statusEl.textContent = msg; }

        // Rebuild the 3x3 board buttons based on current state
        function renderBoard() {
            boardEl.innerHTML = '';
            game.board.forEach((val, idx) => {
                const cell = document.createElement('button');
                cell.className = 'ttt-cell';
                cell.type = 'button';
                cell.setAttribute('data-idx', idx);
                cell.setAttribute('aria-label', 'Cell ' + (idx + 1));
                cell.textContent = val || '';
                if (game.over || val || !game.isMyTurn()) cell.classList.add('disabled');
                cell.addEventListener('click', () => handleMove(idx));
                boardEl.appendChild(cell);
            });
        }

        // Return win/draw info or null; includes winning line for highlight
        function checkWin(board) {
            const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
            for (const [a, b, c] of lines) { if (board[a] && board[a] === board[b] && board[a] === board[c]) return { w: board[a], line: [a, b, c] }; }
            if (board.every(Boolean)) return { draw: true };
            return null;
        }

        function highlightWin(line) {
            if (!line) return;
            qAll('.ttt-cell').forEach(cell => {
                const i = Number(cell.getAttribute('data-idx'));
                if (line.includes(i)) cell.classList.add('winning');
            });
        }

        function qAll(sel) { return Array.from(document.querySelectorAll(sel)); }

        // Local player attempts a move on index; sends to peer if valid
        function handleMove(idx) {
            if (game.over) return;
            if (!game.isMyTurn()) return;
            if (game.board[idx]) return;
            game.board[idx] = game.turn;
            const r = checkWin(game.board);
            if (r) {
                game.over = true;
                if (r.line) highlightWin(r.line);
                if (r.draw) setStatus('Draw!'); else setStatus(r.w + ' wins!');
                // Include symbol for robustness (receiver no longer relies on sequencing)
                send({ type: 'move', idx, sym: game.turn });
            } else {
                game.turn = game.turn === 'X' ? 'O' : 'X';
                send({ type: 'move', idx, sym: game.board[idx] });
                updateTurnStatus();
            }
            renderBoard();
        }

        function updateTurnStatus() {
            if (game.over) return;
            setStatus('Turn: ' + game.turn + (game.isMyTurn() ? ' (Your move)' : ' (Waiting)'));
        }

        // Reset board; if push==true propagate to peer (host authoritative)
        function reset(push) {
            if (push) {
                if (rtc && rtc.role === 'host') {
                    const hostIsX = Math.random() < 0.5;
                    game.mySymbol = hostIsX ? 'X' : 'O';
                    send({ type: 'roles', xRole: hostIsX ? 'host' : 'join', v: 2 });
                } else if (!rtc) {
                    // Local (non peer-to-peer) game: always be X so user consistently starts.
                    game.mySymbol = 'X';
                }
            }
            game.board = Array(9).fill(null);
            game.turn = 'X';
            game.over = false;
            renderBoard();
            setStatus('New game. You are ' + game.mySymbol + '.');
            showToast('Game reset');
            if (push) {
                if (!rtc || rtc.role === 'host') {
                    send({ type: 'reset' });
                }
            }
        }

        resetBtn.addEventListener('click', () => {
            if (!rtc) {
                reset(true);
            } else if (rtc.role === 'host') {
                reset(true);
            } else {
                send({ type: 'request-reset' });
                showToast('Requested new game');
            }
        });

        hostBtn.addEventListener('click', async () => {
            if (rtc) cleanupRTC();
            await createRTC('host');
            game.board = Array(9).fill(null);
            game.turn = 'X';
            game.over = false;
            renderBoard();
            setStatus('Hosting… waiting for peer.');
            renderHostUI();
            // Keep host button enabled so user can recopy link on demand (recreates session each time).
            if (joinBtn) joinBtn.disabled = true;
        });

        // Auto-join if URL has ?join=1 (offer link or embedded offer)
        try {
            const params = new URLSearchParams(location.search);
            if (params.get('join') === '1') {
                (async () => {
                    if (rtc) cleanupRTC();
                    await createRTC('join');
                    game.board = Array(9).fill(null);
                    game.turn = 'X';
                    game.over = false;
                    renderBoard();
                    const embeddedCode = params.get('code');
                    setStatus(embeddedCode ? 'Joining… establishing session.' : 'Join link missing code.');
                    renderJoinUI(); // will create copy button; we will move it next to reset
                    if (embeddedCode) {
                        applyEmbeddedHostCode(embeddedCode);
                    } else {
                        showToast('Missing host code');
                    }
                    // Hide host button completely while in join mode
                    hostBtn.style.display = 'none';
                    if (joinBtn) joinBtn.style.display = 'none';
                })();
            }
        } catch (_) { }

        function buildJoinLink(code) {
            return location.origin + location.pathname + '?join=1' + (code ? '&code=' + encodeURIComponent(code) : '');
        }

        // Host sees only textarea for peer's Accept Code -> Apply
        function renderHostUI() {
            signalContainer.hidden = false;
            // Host view: we already copied the join link to clipboard automatically.
            // Show only the Accept Code input + Apply button (no join link instructions or copy button).
            signalContainer.innerHTML = `
                <textarea id="remote-answer" placeholder="Paste peer Accept Code"></textarea>
                <div class="signal-inline">
                    <button type="button" class="ttt-btn" id="apply-answer">Apply Accept Code</button>
                </div>`;
            $('apply-answer').addEventListener('click', async () => {
                const v = $('remote-answer').value.trim();
                if (!v || !rtc) return;
                try {
                    const d = await decodeGameCode(v);
                    await rtc.pc.setRemoteDescription(d);
                    showToast('Accept Code applied');
                    hideSignalContainerDeferred();
                } catch (e) {
                    showToast('Invalid Accept Code');
                }
            });
        }

        // Joiner gets a Copy Accept Code button colocated by role buttons
        function renderJoinUI() {
            // We want only two buttons visible: Reset and Copy Accept Code side-by-side.
            // Insert Copy Accept Code button into the existing role-buttons container rather than signal section.
            const roleBtns = document.querySelector('.role-buttons');
            if (!roleBtns) return;
            // Remove any previous copy button
            const existing = document.getElementById('copy-answer');
            if (existing) existing.remove();
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.id = 'copy-answer';
            copyBtn.className = 'ttt-btn';
            copyBtn.textContent = 'Copy Accept Code';
            copyBtn.disabled = true;
            roleBtns.appendChild(copyBtn);
            copyBtn.addEventListener('click', async () => {
                if (!rtc || !rtc.pc.localDescription || rtc.pc.localDescription.type !== 'answer') return; await autoCopy(await encodeGameCode(rtc.pc.localDescription), 'Accept Code copied');
            });
            // Hide signal container if previously used
            signalContainer.hidden = true; signalContainer.innerHTML = '';
        }

        // Send JSON message over data channel (ignore if not open)
        function send(obj) {
            if (rtc && rtc.dc && rtc.dc.readyState === 'open') {
                try { rtc.dc.send(JSON.stringify(obj)); } catch (e) { }
            }
        }
        async function applyEmbeddedHostCode(code) {
            if (!rtc || rtc.role !== 'join') return;
            try {
                const d = await decodeGameCode(code);
                await rtc.pc.setRemoteDescription(d);
                const ans = await rtc.pc.createAnswer();
                await rtc.pc.setLocalDescription(ans);
                const copyBtn = document.getElementById('copy-answer');
                if (copyBtn) copyBtn.disabled = false;
            } catch (e) {
                showToast('Failed to apply host code');
            }
        }

        function onMessage(evt) {
            let m; try { m = JSON.parse(evt.data); } catch (e) { return; }
            if (m.type === 'move') {
                const idx = m.idx;
                // Use provided symbol (sym) if valid; fallback to current turn for backward compatibility
                const sym = (m.sym === 'X' || m.sym === 'O') ? m.sym : game.turn;
                if (!game.board[idx] && !game.over) {
                    game.board[idx] = sym;
                    const r = checkWin(game.board);
                    if (r) {
                        game.over = true;
                        if (r.line) highlightWin(r.line);
                        if (r.draw) setStatus('Draw!'); else setStatus(r.w + ' wins!');
                    } else {
                        game.turn = game.turn === 'X' ? 'O' : 'X';
                        updateTurnStatus();
                    }
                    renderBoard();
                }
            } else if (m.type === 'roles') {
                applyRolesMessage(m);
            } else if (m.type === 'reset') {
                game.board = Array(9).fill(null);
                game.turn = 'X';
                game.over = false;
                renderBoard();
                setStatus('New game. You are ' + game.mySymbol + '.');
                showToast('Game reset');
            } else if (m.type === 'request-reset') {
                if (rtc && rtc.role === 'host') {
                    reset(true);
                }
            }
        }

        async function createRTC(role) {
            const cfg = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(cfg);
            rtc = { pc, dc: null, role };
            if (role === 'host') {
                // Reset single-copy flag for a fresh hosting session
                hostLinkCopied = false;
                const dc = pc.createDataChannel('ttt', { ordered: true });
                setupDC(dc);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                // Defer copying until ICE gathering completes so we only show one toast
            } else {
                pc.ondatachannel = e => setupDC(e.channel);
            }
            async function maybeCopy() {
                if (pc.iceGatheringState === 'complete') {
                    if (role === 'host' && !hostLinkCopied) {
                        // Encode offer only once and copy URL with embedded code
                        const offerCode = await encodeGameCode(pc.localDescription);
                        await autoCopy(buildJoinLink(offerCode), 'Join link copied');
                        hostLinkCopied = true;
                    }
                    else if (role === 'join' && pc.localDescription?.type === 'answer') {
                        // no auto-copy; user clicks button
                    }
                }
            }
            pc.onicecandidate = () => maybeCopy();
            pc.onicegatheringstatechange = () => maybeCopy();
            pc.oniceconnectionstatechange = () => { peerStateEl.textContent = 'ICE: ' + pc.iceConnectionState; };
            pc.onconnectionstatechange = () => { peerStateEl.textContent = 'Peer: ' + pc.connectionState; };
        }

        // Wire up data channel lifecycle + initial sync
        function setupDC(dc) {
            dc.onopen = () => {
                showToast('Connected');
                toggleHostJoinVisibility(true);
                if (rtc && rtc.role === 'host') {
                    reset(true);
                }
                updateTurnStatus();
                // Remove Copy Accept Code button after connection established for joiner
                if (rtc && rtc.role === 'join') {
                    const copyBtn = document.getElementById('copy-answer');
                    if (copyBtn) copyBtn.remove();
                }
            };
            dc.onclose = () => { showToast('Disconnected'); toggleHostJoinVisibility(false); };
            dc.onerror = () => { showToast('Channel error'); toggleHostJoinVisibility(false); };
            dc.onmessage = onMessage;
            rtc.dc = dc;
        }

        function cleanupRTC() {
            if (!rtc) return;
            try { rtc.dc && rtc.dc.close(); } catch (e) { }
            try { rtc.pc.close(); } catch (e) { }
            rtc = null;
        }

        window.addEventListener('beforeunload', cleanupRTC);

        renderBoard();
        setStatus('Local game. Click Host to create a shareable join link.');
    }

    // Ensure a single toast div exists (lazy created)
    function ensureToast() { let t = q('.ttt-toast'); if (!t) { t = document.createElement('div'); t.className = 'ttt-toast'; document.body.appendChild(t); } return t; }
    let toastTimer = null;
    function showToast(msg) { const t = ensureToast(); t.style.display = 'block'; t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }

    // Clipboard helper with fallback to execCommand for older browsers
    async function autoCopy(text, msg) { let ok = false; try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { try { const ta = document.createElement('textarea'); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok = true; } catch (_) { } } showToast(ok ? (msg || 'Copied') : 'Copy failed'); }

    // Encode RTCSessionDescription into compact shareable string (gzip if supported)
    async function encodeGameCode(desc) {
        const payload = JSON.stringify({ t: desc.type, s: desc.sdp });
        try {
            if (window.CompressionStream) {
                const cs = new CompressionStream('gzip');
                const blob = new Blob([payload]);
                const compressed = await new Response(blob.stream().pipeThrough(cs)).arrayBuffer();
                return 'G1' + arrayBufferToBase64(compressed);
            }
        } catch (e) { }
        return 'G0' + btoa(payload);
    }

    // Decode previously encoded game code back to RTCSessionDescriptionInit
    async function decodeGameCode(code) {
        code = code.trim();
        if (/^G[01]/.test(code)) {
            const mode = code.slice(0, 2);
            const b64 = code.slice(2);
            const bytes = base64ToUint8Array(b64);
            if (mode === 'G1' && window.DecompressionStream) {
                try {
                    const ds = new DecompressionStream('gzip');
                    const decompressed = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
                    const obj = JSON.parse(decompressed);
                    return { type: obj.t, sdp: obj.s };
                } catch (e) { }
            }
            if (mode === 'G0') {
                try { const text = new TextDecoder().decode(bytes); const obj = JSON.parse(text); return { type: obj.t, sdp: obj.s }; } catch (e) { }
            }
            throw new Error('Bad code');
        } else {
            try { const obj = JSON.parse(code); if (obj.type && obj.sdp) return obj; } catch (e) { }
            throw new Error('Bad code');
        }
    }

    function arrayBufferToBase64(buf) {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }
    function base64ToUint8Array(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    // Hide + clear the signaling container after slight delay (for UX)
    function hideSignalContainerDeferred() {
        const sc = document.getElementById('signal-container');
        if (!sc) return;
        setTimeout(() => { sc.hidden = true; sc.innerHTML = ''; }, 400);
    }

    // Show/hide Host / Join role buttons (after connection hides them)
    function toggleHostJoinVisibility(hide) {
        const hostBtn = document.getElementById('ttt-host');
        const joinBtn = document.getElementById('ttt-join');
        if (!hostBtn) return;
        if (hide) {
            hostBtn.style.display = 'none';
            if (joinBtn) joinBtn.style.display = 'none';
        } else {
            hostBtn.style.display = '';
            hostBtn.disabled = false;
            if (joinBtn) { joinBtn.style.display = ''; joinBtn.disabled = false; }
        }
    }

    // Apply role/side assignment (host communicated which role is X)
    function applyRolesMessage(msg) {
        if (!rtc || !game) return;
        const myRole = rtc.role;
        game.mySymbol = (myRole === msg.xRole) ? 'X' : 'O';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
