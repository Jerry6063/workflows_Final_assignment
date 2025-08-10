// poll-canvases.js — Favorite canvas poll (6 options), refined UI
document.addEventListener('DOMContentLoaded', () => {
  // --- Firebase config (你的同一套) ---
  const firebaseConfig = {
    apiKey: "AIzaSyBztCH3oTTWUgPDDAY6LGL_3DBpPxLHkkA",
    authDomain: "poll-tutorial-f4253.firebaseapp.com",
    databaseURL: "https://poll-tutorial-f4253-default-rtdb.firebaseio.com",
    projectId: "poll-tutorial-f4253",
    storageBucket: "poll-tutorial-f4253.firebasestorage.app",
    messagingSenderId: "875587354505",
    appId: "1:875587354505:web:02b4634304cf9da6cbeb58",
    measurementId: "G-YPGR6MM6V5"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // --- Options ---
  const OPTIONS = [
    { id:"canvas1", label:"2D Drawing with Primitives" },
    { id:"canvas2", label:"Drawing Lines" },
    { id:"canvas3", label:"Orbit Control" },
    { id:"canvas4", label:"Temporal Structures" },
    { id:"canvas5", label:"Relational Structures — NYC Subway" },
    { id:"canvas6", label:"Geospatial Structures — Manhattan" }
  ];

  const totalEl = document.getElementById('total-votes');
  const statusEl = document.getElementById('connection-status');

  // 初次写入为 0
  db.ref('poll/canvases').once('value').then(snap => {
    if (!snap.exists()) {
      const zeros = Object.fromEntries(OPTIONS.map(o => [o.id, 0]));
      return db.ref('poll/canvases').set(zeros);
    }
  });

  // 恢复本地“已投”高亮
  const saved = localStorage.getItem('favoriteCanvasVote');
  if (saved) setActive(saved);

  // 实时监听
  db.ref('poll/canvases').on('value', snap => {
    const data = snap.val() || {};
    let total = 0;
    OPTIONS.forEach(o => total += (data[o.id] || 0));
    totalEl.textContent = total;

    OPTIONS.forEach(o => {
      const n = data[o.id] || 0;
      const countEl = document.getElementById(`count-${o.id}`);
      const btnEl = document.getElementById(`btn-${o.id}`);
      if (!countEl || !btnEl) return;

      // 数字
      countEl.textContent = n;
      countEl.classList.remove('updated'); void countEl.offsetWidth; countEl.classList.add('updated');

      // 占比进度条（通过 CSS 变量驱动）
      const pct = total > 0 ? Math.round(n / total * 100) : 0;
      btnEl.style.setProperty('--pct', pct + '%');
      btnEl.title = `${o.label} · ${n} votes (${pct}%)`;
    });
  });

  // 点按投票（transaction 保证并发安全）
  OPTIONS.forEach(o => {
    const btn = document.getElementById(`btn-${o.id}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      db.ref(`poll/canvases/${o.id}`).transaction(curr => (curr || 0) + 1)
        .then(() => {
          setActive(o.id);
          toast(`Thanks! You voted for “${o.label}”.`);
          localStorage.setItem('favoriteCanvasVote', o.id);
        })
        .catch(err => toast(`Vote failed: ${err.message}`, true));
    });
  });

  // 连接状态
  db.ref('.info/connected').on('value', snap => {
    const ok = snap.val();
    statusEl.innerHTML = ok
      ? '<p style="color:#2e7d32;">✅ Connected to Firebase</p>'
      : '<p style="color:#d32f2f;">❌ Disconnected from Firebase</p>';
  });

  // 本地选中态
  function setActive(id){
    OPTIONS.forEach(o => {
      const el = document.getElementById(`btn-${o.id}`);
      if (el) el.dataset.active = (o.id === id) ? "true" : "false";
    });
  }

  // 轻量提示
  function toast(msg, isErr=false){
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = `
      position:fixed; right:20px; top:20px; z-index:9999;
      background:${isErr?'#d32f2f':'#2e7d32'}; color:#fff; padding:10px 14px;
      border-radius:10px; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,.18);
      opacity:0; transform:translateY(-6px); transition:all .2s ease;
    `;
    document.body.appendChild(d);
    requestAnimationFrame(()=>{ d.style.opacity='1'; d.style.transform='translateY(0)'; });
    setTimeout(()=>{ d.style.opacity='0'; d.style.transform='translateY(-6px)'; setTimeout(()=>d.remove(),200); }, 2000);
  }
});
