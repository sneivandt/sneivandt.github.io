/* tictactoe.js
 * Standalone Tic Tac Toe page with simplified WebRTC manual signaling.
 */
(function () {
    'use strict';

    let rtc = null; // { pc, dc, role }
    let game = null;
    // Random X assignment happens every network game; host acts as authority.

    function $(id) { return document.getElementById(id); }
    function q(sel) { return document.querySelector(sel); }

    function init() {
        const boardEl = $('ttt-board');
        const statusEl = $('ttt-status');
        const peerStateEl = $('ttt-peer-state');
        const hostBtn = $('ttt-host');
        const joinBtn = $('ttt-join');
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
                send({ type: 'move', idx });
            } else {
                game.turn = game.turn === 'X' ? 'O' : 'X';
                send({ type: 'move', idx });
                updateTurnStatus();
            }
            renderBoard();
        }

        function updateTurnStatus() {
            if (game.over) return;
            setStatus('Turn: ' + game.turn + (game.isMyTurn() ? ' (Your move)' : ' (Waiting)'));
        }

        function reset(push) {
            // If this is a network game and host is initiating a new game (push true), choose X now
            if (push) {
                if (rtc && rtc.role === 'host') {
                    const hostIsX = Math.random() < 0.5;
                    game.mySymbol = hostIsX ? 'X' : 'O';
                    send({ type: 'roles', xRole: hostIsX ? 'host' : 'join', v: 2 });
                } else if (!rtc) {
                    // Local game: randomize X player; assign current user symbol.
                    const iAmX = Math.random() < 0.5;
                    game.mySymbol = iAmX ? 'X' : 'O';
                }
            }

            game.board = Array(9).fill(null);
            game.turn = 'X';
            game.over = false;
            renderBoard();
            setStatus('New game. You are ' + game.mySymbol + '.');
            // Uniform toast so both sides (and local mode) get feedback immediately
            showToast('Game reset');

            if (push) {
                // Only host sends reset in network mode; local game (no rtc) also allowed
                if (!rtc || rtc.role === 'host') {
                    send({ type: 'reset' });
                }
            }
        }

        resetBtn.addEventListener('click', () => {
            if (!rtc) {
                reset(true); // local only
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
            // Do not announce symbol yet; it will be randomized on connection open.
            game.board = Array(9).fill(null);
            game.turn = 'X';
            game.over = false;
            renderBoard();
            setStatus('Hosting… waiting for peer.');
            renderHostUI();
            hostBtn.disabled = true; joinBtn.disabled = true;
        });

        joinBtn.addEventListener('click', async () => {
            if (rtc) cleanupRTC();
            await createRTC('join');
            // Symbol will be assigned when roles message arrives after host randomizes.
            game.board = Array(9).fill(null);
            game.turn = 'X';
            game.over = false;
            renderBoard();
            setStatus('Joining… apply host Game Code.');
            renderJoinUI();
            hostBtn.disabled = true; joinBtn.disabled = true;
        });

        // Cancel button removed: connection can be abandoned by refreshing page.

        function renderHostUI() {
            signalContainer.hidden = false;
            signalContainer.innerHTML = `
                <label style="font-size:.7rem;opacity:.7;">Your Game Code (Offer) is copied. Share it. Paste partner's Game Code (Answer) below.</label>
                <textarea id="remote-answer" placeholder="Paste partner Game Code (Answer)"></textarea>
        <div class="signal-inline">
                    <button type="button" class="ttt-btn" id="apply-answer">Apply</button>
        </div>`;
            $('apply-answer').addEventListener('click', async () => {
                const v = $('remote-answer').value.trim(); if (!v || !rtc) return; try { const d = await decodeGameCode(v); await rtc.pc.setRemoteDescription(d); showToast('Game Code applied'); hideSignalContainerDeferred(); } catch (e) { showToast('Invalid Game Code'); }
            });
        }

        function renderJoinUI() {
            signalContainer.hidden = false;
            signalContainer.innerHTML = `
                <label style="font-size:.7rem;opacity:.7;">Paste Host Game Code → Apply. Your Game Code (Answer) auto-copies.</label>
                <textarea id="host-offer" placeholder="Paste Host Game Code (Offer)"></textarea>
        <div class="signal-inline">
                    <button type="button" class="ttt-btn" id="apply-offer">Apply</button>
        </div>`;
            $('apply-offer').addEventListener('click', async () => {
                const v = $('host-offer').value.trim(); if (!v || !rtc) return; try { const d = await decodeGameCode(v); await rtc.pc.setRemoteDescription(d); if (rtc.role === 'join') { const ans = await rtc.pc.createAnswer(); await rtc.pc.setLocalDescription(ans); await autoCopy(await encodeGameCode(rtc.pc.localDescription), 'Game Code copied'); } showToast('Game Code applied'); hideSignalContainerDeferred(); } catch (e) { showToast('Invalid Game Code'); }
            });
        }

        function send(obj) {
            if (rtc && rtc.dc && rtc.dc.readyState === 'open') {
                try { rtc.dc.send(JSON.stringify(obj)); } catch (e) { }
            }
        }

        function onMessage(evt) {
            let m; try { m = JSON.parse(evt.data); } catch (e) { return; }
            if (m.type === 'move') {
                const idx = m.idx;
                if (!game.board[idx] && !game.over) {
                    game.board[idx] = game.turn; // remote played current turn
                    const r = checkWin(game.board);
                    if (r) {
                        game.over = true; if (r.line) highlightWin(r.line); if (r.draw) setStatus('Draw!'); else setStatus(r.w + ' wins!');
                    } else {
                        game.turn = game.turn === 'X' ? 'O' : 'X'; updateTurnStatus();
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
                    reset(true); // host triggers new random assignment & reset
                }
            }
        }

        async function createRTC(role) {
            const cfg = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(cfg);
            rtc = { pc, dc: null, role };
            if (role === 'host') {
                const dc = pc.createDataChannel('ttt', { ordered: true });
                setupDC(dc);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await autoCopy(await encodeGameCode(pc.localDescription), 'Game Code copied');
            } else {
                pc.ondatachannel = e => setupDC(e.channel);
            }

            async function maybeCopy() {
                if (pc.iceGatheringState === 'complete') {
                    if (role === 'host') await autoCopy(await encodeGameCode(pc.localDescription), 'Game Code updated');
                    else if (role === 'join' && pc.localDescription?.type === 'answer') await autoCopy(await encodeGameCode(pc.localDescription), 'Game Code copied');
                }
            }
            pc.onicecandidate = () => maybeCopy();
            pc.onicegatheringstatechange = () => maybeCopy();
            pc.oniceconnectionstatechange = () => { peerStateEl.textContent = 'ICE: ' + pc.iceConnectionState; };
            pc.onconnectionstatechange = () => { peerStateEl.textContent = 'Peer: ' + pc.connectionState; };
        }

        function setupDC(dc) {
            dc.onopen = () => {
                showToast('Connected');
                toggleHostJoinVisibility(true);
                // Host initiates first game with randomized roles.
                if (rtc && rtc.role === 'host') {
                    reset(true); // will send roles + reset
                }
                updateTurnStatus();
            };
            dc.onclose = () => { showToast('Disconnected'); toggleHostJoinVisibility(false); };
            dc.onerror = () => { showToast('Channel error'); toggleHostJoinVisibility(false); };
            dc.onmessage = onMessage;
            rtc.dc = dc;
        }

        function cleanupRTC() {
            if (rtc) { try { rtc.dc && rtc.dc.close(); } catch (e) { } try { rtc.pc.close(); } catch (e) { } rtc = null; }
        }

        window.addEventListener('beforeunload', cleanupRTC);

        renderBoard();
        setStatus('Local game. Choose Host or Join for P2P.');
    }

    function ensureToast() { let t = q('.ttt-toast'); if (!t) { t = document.createElement('div'); t.className = 'ttt-toast'; document.body.appendChild(t); } return t; }
    let toastTimer = null;
    function showToast(msg) { const t = ensureToast(); t.style.display = 'block'; t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }

    async function autoCopy(text, msg) { let ok = false; try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { try { const ta = document.createElement('textarea'); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok = true; } catch (_) { } } showToast(ok ? (msg || 'Copied') : 'Copy failed'); }

    // Game Code encoding/decoding utilities
    // Format prefixes: G1 = gzip+base64 of JSON {t,type; s,sdp}; G0 = plain base64 fallback
    async function encodeGameCode(desc) {
        const payload = JSON.stringify({ t: desc.type, s: desc.sdp });
        try {
            if (window.CompressionStream) {
                const cs = new CompressionStream('gzip');
                const blob = new Blob([payload]);
                const compressed = await new Response(blob.stream().pipeThrough(cs)).arrayBuffer();
                return 'G1' + arrayBufferToBase64(compressed);
            }
        } catch (e) { /* ignore, fallback below */ }
        return 'G0' + btoa(payload);
    }

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
                } catch (e) { /* fall through to try as plain */ }
            }
            if (mode === 'G0') {
                try { const text = new TextDecoder().decode(bytes); const obj = JSON.parse(text); return { type: obj.t, sdp: obj.s }; } catch (e) { }
            }
            throw new Error('Bad code');
        } else {
            // Backwards compatibility: raw JSON (old flow)
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

    // Hide signal UI a short moment after application to allow user to see success toast first
    function hideSignalContainerDeferred() {
        const sc = document.getElementById('signal-container');
        if (!sc) return;
        setTimeout(() => { sc.hidden = true; sc.innerHTML = ''; }, 400);
    }

    function toggleHostJoinVisibility(hide) {
        const hostBtn = document.getElementById('ttt-host');
        const joinBtn = document.getElementById('ttt-join');
        if (!hostBtn || !joinBtn) return;
        if (hide) {
            hostBtn.style.display = 'none';
            joinBtn.style.display = 'none';
        } else {
            hostBtn.style.display = '';
            joinBtn.style.display = '';
            hostBtn.disabled = false;
            joinBtn.disabled = false;
        }
    }

    function applyRolesMessage(msg) {
        if (!rtc || !game) return;
        const myRole = rtc.role;
        game.mySymbol = (myRole === msg.xRole) ? 'X' : 'O';
    }

    // Handle messages outside init scope via event delegation in onMessage (within init)
    // Additional message type handled: request-reset (join asks host to start a new game)

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
