// ── Animated background canvas ──────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], frame = 0;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

for (let i = 0; i < 60; i++) {
  nodes.push({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5
  });
}

function drawCanvas() {
  ctx.clearRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(0,180,255,0.025)';
  ctx.lineWidth = 1;
  const gs = 80;
  for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Moving nodes + connections
  nodes.forEach((n, i) => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,180,255,0.35)';
    ctx.fill();

    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[j].x - n.x, nodes[j].y - n.y);
      if (d < 140) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(0,180,255,${0.06 * (1 - d / 140)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  });

  frame++;
  requestAnimationFrame(drawCanvas);
}
drawCanvas();

// ── Scroll progress ──────────────────────────────────────
const scrollBar = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  scrollBar.style.width = pct + '%';
});

// ── Reveal on scroll ─────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));

// ── Mobile menu ──────────────────────────────────────────
function toggleMenu() {
  const m = document.getElementById('mobile-menu');
  m.classList.toggle('open');
}
function closeMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
}

// ── Modal data ───────────────────────────────────────────
const modals = {
  pid: {
    title: 'PID-Controlled DC Motor Stabilisation System',
    stack: 'Raspberry Pi 4 · Python · L298N · Optical Encoder · MATLAB/Simulink · EasyEDA · Two-Layer PCB',
    sections: [
      { h: 'Problem Statement', body: 'Design a motor control system that brings a 12V DC motor from rest to a desired RPM with overshoot below 15%, no sustained oscillations, and steady-state error under 2% — validated against a formal specification.' },
      { h: 'Engineering Approach', body: 'Used MATLAB/Simulink to build and tune a closed-loop PI model before touching hardware. Chose PI over PID after experimental testing confirmed that adding the derivative term amplified encoder quantisation noise without improving overshoot or rise time — a deliberate and documented engineering decision.' },
      { h: 'Technical Implementation', list: ['PI controller: Kp=1, Ki=0.45, Kd=0 — tuned using Ziegler-Nichols as starting point, refined experimentally', 'Interrupt-driven encoder pulse counting on Raspberry Pi GPIO for accurate RPM feedback', 'Custom two-layer PCB: encoder signal paths isolated from high-current motor traces to eliminate noise coupling', 'Separate power rails for logic (Raspberry Pi) and motor (L298N + DC motor) — prevents switching transients corrupting measurements', 'Real-time Python GUI: live RPM graph, Kp/Ki sliders, PWM monitoring, CSV data logging'] },
      { h: 'Results', list: ['Overshoot: <15% ✓', 'Steady-state error: <2% ✓', 'No sustained oscillations ✓', 'MATLAB/Simulink simulation confirmed before hardware implementation ✓', 'PCB DRC verified and oscilloscope validated ✓'] },
      { h: 'Key Engineering Lesson', body: 'The derivative term should be justified by data, not added by default. In this system, Kd increased noise sensitivity without measurable benefit. Omitting it is the correct engineering decision — and the rationale must be documented.' }
    ],
    metrics: [{ val: '<15%', label: 'Overshoot' }, { val: '<2%', label: 'SS Error' }, { val: 'Kp=1, Ki=0.45', label: 'Final Gains' }, { val: '2-layer', label: 'PCB' }]
  },
  line: {
    title: 'Line-Following Arduino Car with Autonomous Parking',
    stack: 'AVR Assembly · ATmega328P · Arduino Uno · L298N · 3× IR Sensors · 38 kHz IR Receiver',
    github: 'https://github.com/sriabiram05/avr-line-follower.git',
    sections: [
      { h: 'Problem Statement', body: 'Design and build a fully autonomous robot that follows a predefined track, handles line loss and recovery, and parks autonomously in a designated bay — programmed entirely in AVR Assembly with zero library dependencies.' },
      { h: 'Engineering Approach', body: 'All peripheral configuration (DDR/PORT/PIN registers, Timer0 Fast PWM, ADC) written at register level. System designed as a formal finite state machine to ensure deterministic behavior across all operational scenarios.' },
      { h: '8-State FSM Design', list: ['State 1: Initialization — configure all I/O, timers, ADC', 'State 2: Line Following — 3-sensor IR detection, real-time motor correction', 'State 3: Marker Detection — all-sensor (111) pattern triggers mode switch', 'State 4: Slow Mode — reduced PWM for parking zone approach', 'State 5: Parking Detection — ADC threshold comparison on A0 for IR signal', 'State 6: Parking Execution — 7-step deterministic manoeuvre sequence', 'State 7: Lost Line Recovery — alternating left/right swing search', 'State 8: Stop — permanent halt after successful parking'] },
      { h: 'Key Design Decisions', list: ['Analog IR parking detection (ADC) over digital — configurable sensitivity margin against ambient IR interference', 'Digital line sensors over analog — eliminates ADC conversion delay for faster response', '7-step parking sequence: stop → left turn → reverse → left turn → reverse → forward → stop'] },
      { h: 'Test Results', list: ['Scenario 1: Straight line — PASS', 'Scenario 2: Left curve — PASS', 'Scenario 3: Right curve — PASS', 'Scenario 4: Sharp turns — PASS (minor deviation, within spec)', 'Scenario 5: Line loss recovery + autonomous parking — PASS', 'Overall: 5/5 scenarios — 100% pass rate ✓'] }
    ],
    metrics: [{ val: '100%', label: 'Pass Rate' }, { val: '8', label: 'FSM States' }, { val: '0', label: 'Libraries Used' }, { val: '5/5', label: 'Test Scenarios' }]
  },
  cache: {
    title: 'Cache Design & Performance Analysis Simulator',
    stack: 'Python · Computer Architecture · Trace-Driven Simulation · IEEE/ACM Literature Review',
    sections: [
      { h: 'Problem Statement', body: 'Investigate how key L1 cache design parameters affect performance, starting from theory (6 testable hypotheses derived from IEEE/ACM papers) and validating through a custom trace-driven simulator.' },
      { h: 'Methodology', list: ['Step 1: Literature review — synthesized 6 testable hypotheses (H1–H6) from peer-reviewed sources', 'Step 2: Python simulator — swept 36 parameter combinations', 'Parameters swept: Line size (16B, 32B, 64B, 128B), Associativity (1-way, 2-way, 4-way), Policy (LRU, FIFO, Random)', 'Key metric: AMAT = HitTime + MissRatio × MissPenalty'] },
      { h: 'Finding 1 — Optimal Line Size', body: 'Miss ratio dropped from 0.237 (16B) → 0.181 (32B) → 0.155 (64B) — a 35% reduction. Performance degraded at 128B due to over-fetch and cache pollution. 64B confirmed as the spatial locality sweet-spot, matching industry standard.' },
      { h: 'Finding 2 — Diminishing Returns in Associativity', body: 'Direct-mapped to 2-way produced a significant conflict-miss reduction. 2-way to 4-way yielded negligible further gain. Conclusion: 2-way is the optimal cost-performance point for an L1 cache — hardware complexity not justified beyond this.' },
      { h: 'Finding 3 — Policy Equivalence on This Workload', body: 'LRU, FIFO, and Random converged to nearly identical miss ratios (~0.1806) on the test trace. This confirmed that policy advantage is workload-dependent — the trace had low capacity pressure, making replacement policy selection irrelevant.' },
      { h: 'Optimal Configuration', body: '64B line size, 2-way associativity, LRU policy → AMAT ~13.0 ns. This aligns with real-world industry L1 cache design practice.' }
    ],
    metrics: [{ val: '35%', label: 'Miss Ratio Reduction' }, { val: '13.0ns', label: 'Optimal AMAT' }, { val: '36', label: 'Configurations Tested' }, { val: '6', label: 'Hypotheses Validated' }]
  },
  clims: {
    title: 'CLIMS — Smart Surveillance & Access Control System',
    stack: 'ESP32 · Python · OpenCV · Facial Recognition · Electronic Door Lock · Mobile Push Notifications',
    sections: [
      { h: 'System Overview', body: 'End-to-end IoT security pipeline: PIR motion detection triggers image capture → Python facial recognition pipeline → electronic lock actuation → real-time mobile push notification. Full decision logic runs on a single ESP32 platform.' },
      { h: 'Pipeline Stages', list: ['Stage 1: PIR motion sensor detects presence', 'Stage 2: Camera module captures image', 'Stage 3: Python facial recognition (OpenCV) — known vs unknown classification', 'Stage 4: Decision logic — only unknown faces trigger alert + lock action', 'Stage 5: Electronic door lock actuation via GPIO', 'Stage 6: Mobile push notification dispatch'] },
      { h: 'Key Design Decision', body: 'The system only triggers on confirmed unrecognised faces — not on general motion. This eliminates false positives from pets, ambient movement, or known occupants, making the alert actionable rather than noisy.' },
      { h: 'What This Project Taught', body: 'End-to-end IoT pipeline design: sensor integration, embedded inference, actuator control, and cloud communication — all coordinated through a single microcontroller. Constraint: ESP32 processing limitations required careful image capture timing to avoid pipeline stalls.' }
    ],
    metrics: [{ val: 'E2E', label: 'Full Pipeline' }, { val: 'ESP32', label: 'Single Controller' }, { val: '0', label: 'False Positive Policy' }]
  },
  pcb: {
    title: '1-Digit Asynchronous Up Counter — PCB Design & Fabrication',
    stack: 'EasyEDA · 74HC74 D Flip-Flops · Seven-Segment Display · PCB Fabrication · Oscilloscope',
    sections: [
      { h: 'Project Scope', body: 'Complete hardware lifecycle for a 0–9 asynchronous decimal counter — from schematic capture to oscilloscope-validated physical board. No simulation shortcuts: the board had to work in hardware.' },
      { h: 'Full Lifecycle Completed', list: ['EasyEDA schematic capture — 74HC74 D flip-flop chain for BCD output', 'PCB layout — component placement, trace routing, via placement', 'DRC (Design Rule Check) — sign-off before fabrication', 'Board fabrication — sent to manufacturer', 'Component soldering — through-hole assembly', 'Oscilloscope validation — switching waveform verification at each flip-flop stage', 'Functional test — confirmed correct 0–9 decimal counting sequence'] },
      { h: 'Key Learning', body: 'The gap between simulation and fabricated hardware is real. Race conditions and propagation delays that are invisible in simulation become measurable on the oscilloscope. The physical board matched the simulated timing — a validation result, not an assumption.' }
    ],
    metrics: [{ val: 'Full', label: 'PCB Lifecycle' }, { val: '74HC74', label: 'Logic Device' }, { val: '0–9', label: 'Counter Range' }]
  }
};

function openModal(id) {
  const data = modals[id];
  if (!data) return;

  let html = `<div class="modal-title">${data.title}</div>`;
  html += `<div class="modal-stack">${data.stack}</div>`;

  if (data.github) {
    html += `<div style="margin-bottom: 1.5rem;"><a href="${data.github}" target="_blank" rel="noopener" class="btn-ghost" style="display:inline-flex; width:max-content; padding: 6px 12px; font-size: 0.7rem; gap: 6px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
      Source Code
    </a></div>`;
  }

  if (data.metrics) {
    html += `<div class="modal-section"><div class="modal-metrics-grid">`;
    data.metrics.forEach(m => {
      html += `<div class="modal-metric"><div class="modal-metric-val">${m.val}</div><div class="modal-metric-label">${m.label}</div></div>`;
    });
    html += `</div></div>`;
  }

  data.sections.forEach(s => {
    html += `<div class="modal-section"><h3>${s.h}</h3>`;
    if (s.body) html += `<p>${s.body}</p>`;
    if (s.list) {
      html += `<ul>`;
      s.list.forEach(li => { html += `<li>${li}</li>`; });
      html += `</ul>`;
    }
    html += `</div>`;
  });

  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target.id === 'modal') closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Keyboard accessibility for project cards
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
});



// ── Smooth hero reveal ───────────────────────────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-content > *').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.7s ${i * 0.1}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${i * 0.1}s cubic-bezier(0.16,1,0.3,1)`;
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 100);
  });
});