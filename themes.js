// Фан-теми за мотивами улюблених світів дитини.
// Лише кольори, власні SVG-малюнки та емодзі — без чужих зображень і логотипів.
//
// Поля теми:
//   bg            — CSS-фон сторінки (небо / вода)
//   strip         — CSS-фон смужки зверху на картці з прикладом
//   scene.top     — SVG-розмітка верхньої сцени (viewBox 0 0 800 160, притиснута догори)
//   scene.bottom  — SVG-розмітка нижньої сцени (viewBox 0 0 800 scene.bottomVB, притиснута донизу)
//   floaters      — що пливе на фоні: рядок або {block, top?, ore?} | {glow} | {bubble}
//   passers       — хто іноді пропливає/пролітає екраном: {emoji|svg, size, y:[від,до] у %, dur, every, ltr}
//   runner/goal   — хто і куди біжить у таймері
(function () {
    // ---------- Допоміжне ----------
    // Детермінований генератор випадкових чисел, щоб сцена щоразу була однакова
    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Піксель-арт із рядків: кожен символ — колір з палітри, «.» — порожньо
    function pix(rows, pal, s, x0, y0) {
        let out = "";
        rows.forEach((row, j) => {
            let i = 0;
            while (i < row.length) {
                const ch = row[i];
                if (!pal[ch]) { i++; continue; }
                let k = i;
                while (k < row.length && row[k] === ch) k++;
                out += `<rect x="${x0 + i * s}" y="${y0 + j * s}" width="${(k - i) * s}" height="${s}" fill="${pal[ch]}"/>`;
                i = k;
            }
        });
        return out;
    }

    // Ступінчастий «кубічний» рельєф: повертає висоти колонок
    function blockyTerrain(r, cols, base, step, maxLvl) {
        const tops = [];
        let lvl = Math.floor(maxLvl / 2);
        for (let c = 0; c < cols; c++) {
            if (r() < 0.32) lvl = Math.max(0, Math.min(maxLvl, lvl + (r() < 0.5 ? -1 : 1)));
            tops.push(base - lvl * step);
        }
        return tops;
    }

    // Хмара/обʼєкт, що безшовно їде ліворуч: дублюємо зі зсувом 800
    const drift = (inner, dur = 90) =>
        `<g class="sc-drift" style="animation-duration:${dur}s">${inner}<g transform="translate(800 0)">${inner}</g></g>`;

    const glowCircle = (cx, cy, r, color, cls = "sc-pulse", delay = 0) =>
        `<circle class="${cls}" style="animation-delay:${delay}s" cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity=".35"/>` +
        `<circle class="${cls}" style="animation-delay:${delay}s" cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${color}"/>`;

    // ---------- Майнкрафт ----------
    const OAK = [".LLL.", "LLLLL", "LLlLL", "LLLLL", "..T..", "..T..", "..T.."];
    const OAK_PAL = { L: "#3f8f2e", l: "#56b043", T: "#6b4a2b" };
    const CACTUS = [".g.", ".gG", "gg.", ".g.", ".g."];
    const CACTUS_PAL = { g: "#3d8b3d", G: "#2f6e2f" };
    const CHORUS = ["..p..", "p.p.p", "ppppp", "..p..", "..p.."];
    const CHORUS_PAL = { p: "#8a5aa8" };

    function mcCloud(x, y) {
        return `<rect x="${x}" y="${y}" width="90" height="20" fill="#fff" opacity=".92"/>` +
               `<rect x="${x + 20}" y="${y - 14}" width="45" height="14" fill="#fff" opacity=".92"/>`;
    }

    function plainsTop() {
        let s = `<rect x="590" y="18" width="58" height="58" fill="#fff4a3"/><rect x="599" y="27" width="40" height="40" fill="#ffe14d"/>`;
        s += drift(mcCloud(40, 60) + mcCloud(300, 36) + mcCloud(520, 90) + mcCloud(700, 50), 120);
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function plainsBottom() {
        const r = rng(11), cols = 40, tops = blockyTerrain(r, cols, 130, 20, 3);
        let s = "";
        tops.forEach((y, c) => {
            const x = c * 20;
            s += `<rect x="${x}" y="${y}" width="20" height="${200 - y}" fill="#8b5a2b"/>`;
            s += `<rect x="${x}" y="${y}" width="20" height="7" fill="#5fa83a"/><rect x="${x}" y="${y + 7}" width="20" height="3" fill="#4e9030"/>`;
            for (let k = 0; k < 3; k++) {
                const yy = y + 15 + Math.floor(r() * Math.max(1, (190 - y - 15) / 5)) * 5;
                s += `<rect x="${x + Math.floor(r() * 4) * 5}" y="${yy}" width="5" height="5" fill="${r() < 0.3 ? "#8a8a8a" : "#6b4220"}"/>`;
            }
        });
        [3, 10, 17, 25, 33].forEach(c => { s += pix(OAK, OAK_PAL, 10, c * 20 - 15, tops[c] - 70); });
        tops.forEach((y, c) => {
            if ([3, 10, 17, 25, 33].includes(c)) return;
            if (r() < 0.35) {
                const x = c * 20 + Math.floor(r() * 3) * 5;
                const col = ["#e23b3b", "#ffd23b", "#ffffff", "#7fb8ff"][Math.floor(r() * 4)];
                s += `<rect x="${x}" y="${y - 10}" width="5" height="10" fill="#3f8f2e"/><rect x="${x}" y="${y - 15}" width="5" height="5" fill="${col}"/>`;
            } else if (r() < 0.5) {
                s += `<rect x="${c * 20 + 4}" y="${y - 8}" width="3" height="8" fill="#4e9030"/><rect x="${c * 20 + 11}" y="${y - 6}" width="3" height="6" fill="#4e9030"/>`;
            }
        });
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function desertTop() {
        return `<g shape-rendering="crispEdges"><rect x="560" y="10" width="80" height="80" fill="#fff1b0"/><rect x="572" y="22" width="56" height="56" fill="#ffd84a"/></g>` +
               drift(`<rect x="120" y="70" width="70" height="12" fill="#fff" opacity=".6"/><rect x="450" y="40" width="60" height="10" fill="#fff" opacity=".5"/>`, 160);
    }

    function desertBottom() {
        const r = rng(23), cols = 40, tops = blockyTerrain(r, cols, 140, 15, 3);
        let s = "";
        tops.forEach((y, c) => {
            const x = c * 20;
            s += `<rect x="${x}" y="${y}" width="20" height="${200 - y}" fill="#e8d49a"/>`;
            s += `<rect x="${x}" y="${y + 30}" width="20" height="${Math.max(0, 170 - y)}" fill="#d8c07c"/>`;
            if (r() < 0.5) s += `<rect x="${x + 5}" y="${y + 8}" width="5" height="5" fill="#d6c086"/>`;
        });
        // Пустельна піраміда в центрі
        const base = Math.min(...tops.slice(17, 23));
        for (let i = 0; i < 6; i++) {
            const w = 180 - i * 28, y = base - (i + 1) * 16;
            s += `<rect x="${400 - w / 2}" y="${y}" width="${w}" height="16" fill="${i % 2 ? "#cdb46f" : "#dcc68c"}"/>`;
        }
        s += `<rect x="352" y="${base - 48}" width="96" height="8" fill="#d9772b"/>`;
        s += `<rect x="392" y="${base - 80}" width="16" height="16" fill="#3f7fbf"/>`;
        s += `<rect x="388" y="${base - 30}" width="24" height="30" fill="#8a6a2a"/>`;
        [5, 12, 28, 35].forEach(c => { s += pix(CACTUS, CACTUS_PAL, 10, c * 20 - 5, tops[c] - 50); });
        [8, 31].forEach(c => {
            s += `<path d="M${c * 20 + 10} ${tops[c]} l-8 -12 M${c * 20 + 10} ${tops[c]} l8 -14 M${c * 20 + 10} ${tops[c]} l0 -16" stroke="#8a6a3a" stroke-width="2"/>`;
        });
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function caveTop() {
        const r = rng(31);
        let s = "";
        for (let c = 0; c < 40; c++) {
            const h = 20 + Math.floor(r() * 3) * 10;
            s += `<rect x="${c * 20}" y="0" width="20" height="${h}" fill="${r() < 0.5 ? "#3a3a3a" : "#444"}"/>`;
            if (r() < 0.25) {
                s += `<rect x="${c * 20 + 2}" y="${h}" width="16" height="10" fill="#5a5a5a"/>` +
                     `<rect x="${c * 20 + 5}" y="${h + 10}" width="10" height="10" fill="#5a5a5a"/>` +
                     `<rect x="${c * 20 + 8}" y="${h + 20}" width="4" height="8" fill="#5a5a5a"/>`;
            }
            if (r() < 0.12) s += `<rect x="${c * 20 + 6}" y="${h - 12}" width="6" height="6" fill="#5ff2f2"/>`;
        }
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function caveBottom() {
        const r = rng(37), tops = blockyTerrain(r, 40, 150, 15, 3);
        const ores = ["#5ff2f2", "#f2c94c", "#e23b3b", "#43d16b", "#2b2b2b"];
        let s = "";
        tops.forEach((y, c) => {
            const x = c * 20;
            s += `<rect x="${x}" y="${y}" width="20" height="${200 - y}" fill="#555"/>`;
            s += `<rect x="${x}" y="${y}" width="20" height="4" fill="#666"/>`;
            if (r() < 0.35) {
                const col = ores[Math.floor(r() * ores.length)];
                const yy = y + 12 + Math.floor(r() * 4) * 8;
                s += `<rect x="${x + 4}" y="${yy}" width="5" height="5" fill="${col}"/><rect x="${x + 11}" y="${yy + 6}" width="5" height="5" fill="${col}"/>`;
            }
            if (r() < 0.18) {
                s += `<rect x="${x + 7}" y="${y - 18}" width="6" height="12" fill="#5a5a5a"/><rect x="${x + 9}" y="${y - 26}" width="3" height="8" fill="#5a5a5a"/>`;
            }
        });
        // Факели з мерехтливим вогнем
        [6, 16, 24, 34].forEach((c, i) => {
            const x = c * 20 + 8, y = tops[c];
            s += `<rect x="${x}" y="${y - 22}" width="4" height="22" fill="#6b4a2b"/>`;
            s += `<circle class="sc-flicker" style="animation-delay:${i * 0.3}s" cx="${x + 2}" cy="${y - 26}" r="22" fill="#ffb84d" opacity=".22"/>`;
            s += `<rect class="sc-flicker" style="animation-delay:${i * 0.3}s" x="${x - 1}" y="${y - 30}" width="6" height="7" fill="#ffd36b"/>`;
        });
        // Лава праворуч
        s += `<rect class="sc-pulse" x="660" y="${tops[33] + 10}" width="120" height="30" fill="#ff7a00"/>`;
        s += `<rect x="660" y="${tops[33] + 10}" width="120" height="5" fill="#ffd000" opacity=".8"/>`;
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function netherTop() {
        const r = rng(41);
        let s = "";
        for (let c = 0; c < 40; c++) {
            const h = 25 + Math.floor(r() * 4) * 10;
            s += `<rect x="${c * 20}" y="0" width="20" height="${h}" fill="${r() < 0.5 ? "#5a1f1f" : "#6b2626"}"/>`;
            if (r() < 0.2) {
                s += `<rect x="${c * 20 - 6}" y="${h - 4}" width="18" height="14" fill="#ffd86b"/>` +
                     `<circle class="sc-pulse" cx="${c * 20 + 3}" cy="${h + 3}" r="26" fill="#ffd86b" opacity=".2"/>`;
            }
        }
        // Лавопад
        s += `<rect x="640" y="0" width="26" height="160" fill="#ff7a00"/>`;
        s += `<g class="sc-fall"><rect x="644" y="-40" width="6" height="30" fill="#ffd000"/><rect x="654" y="20" width="6" height="40" fill="#ffd000"/><rect x="646" y="90" width="5" height="30" fill="#ffd000"/></g>`;
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function netherBottom() {
        const r = rng(43);
        let s = "";
        // Лавове море з хвилями
        s += `<rect x="0" y="150" width="800" height="50" fill="#ff6a00"/>`;
        s += `<g class="sc-wave">` + Array.from({ length: 14 }, (_, i) =>
            `<rect x="${i * 60 + (i % 2) * 20}" y="${155 + (i % 3) * 10}" width="30" height="4" fill="#ffd000"/>`).join("") + `</g>`;
        // Острівці незераку
        [[40, 6], [600, 8]].forEach(([x0, n]) => {
            for (let i = 0; i < n; i++) {
                const h = 30 + Math.floor(r() * 3) * 10;
                s += `<rect x="${x0 + i * 20}" y="${150 - h}" width="20" height="${h + 10}" fill="${r() < 0.5 ? "#6e2a2a" : "#7a2f2f"}"/>`;
            }
            s += `<rect x="${x0 + 30}" y="${150 - 60}" width="5" height="10" fill="#c9c9a8"/><rect x="${x0 + 26}" y="${150 - 68}" width="14" height="8" fill="#e23b3b"/>`;
        });
        // Міст фортеці
        s += `<rect x="150" y="70" width="460" height="22" fill="#2b1013"/>`;
        for (let x = 150; x < 610; x += 16) s += `<rect x="${x}" y="70" width="1" height="22" fill="#401a1e"/>`;
        [200, 380, 540].forEach(x => {
            s += `<rect x="${x}" y="92" width="44" height="60" fill="#2b1013"/><rect x="${x + 12}" y="104" width="20" height="48" fill="#ff6a00" opacity=".55"/>`;
        });
        s += `<rect x="150" y="60" width="10" height="10" fill="#2b1013"/><rect x="600" y="60" width="10" height="10" fill="#2b1013"/>`;
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    function endTop() {
        const r = rng(53);
        let s = "";
        for (let i = 0; i < 60; i++) {
            const x = Math.floor(r() * 800), y = Math.floor(r() * 160), size = r() < 0.2 ? 3 : 2;
            s += `<rect class="sc-twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s" x="${x}" y="${y}" width="${size}" height="${size}" fill="#fff"/>`;
        }
        return s;
    }

    function endBottom() {
        const r = rng(59);
        let s = "";
        // Острів енду
        const steps = [[120, 680, 150], [170, 630, 135], [230, 570, 122]];
        steps.forEach(([a, b, y]) => {
            s += `<rect x="${a}" y="${y}" width="${b - a}" height="${200 - y}" fill="#e6e2a8"/>`;
            for (let x = a; x < b; x += 20) if (r() < 0.4) s += `<rect x="${x + 5}" y="${y + 6}" width="5" height="5" fill="#c9c487"/>`;
        });
        // Обсидіанові стовпи з кристалами
        [[260, 80], [340, 40], [450, 60], [540, 95]].forEach(([x, top], i) => {
            s += `<rect x="${x}" y="${top}" width="28" height="${125 - top}" fill="#1b1028"/>`;
            s += `<rect x="${x + 4}" y="${top}" width="4" height="${125 - top}" fill="#2e1b45"/>`;
            const cx = x + 14, cy = top - 16;
            s += `<circle class="sc-pulse" style="animation-delay:${i * 0.5}s" cx="${cx}" cy="${cy}" r="22" fill="#ff9be8" opacity=".25"/>`;
            s += `<rect class="sc-spin" style="animation-delay:${i * 0.4}s" x="${cx - 8}" y="${cy - 8}" width="16" height="16" fill="#ff9be8" stroke="#c77dff" stroke-width="3"/>`;
        });
        s += pix(CHORUS, CHORUS_PAL, 8, 150, 110) + pix(CHORUS, CHORUS_PAL, 8, 610, 110);
        return `<g shape-rendering="crispEdges">${s}</g>`;
    }

    // ---------- Subnautica ----------
    function lightRays(color = "#ffffff", alpha = 0.14) {
        return [80, 230, 400, 560, 700].map((x, i) =>
            `<polygon class="sc-rays" style="animation-delay:${i * 1.3}s" points="${x},0 ${x + 40},0 ${x + 110},160 ${x + 10},160" fill="${color}" opacity="${alpha}"/>`
        ).join("");
    }

    function shallowsTop() {
        return `<path d="M0 0 H800 V14 Q760 24 720 14 T640 14 T560 14 T480 14 T400 14 T320 14 T240 14 T160 14 T80 14 T0 14 Z" fill="#ffffff" opacity=".35" class="sc-wave"/>` +
               lightRays();
    }

    function seaGrass(x, base, h, color, delay) {
        return `<path class="sc-sway" style="animation-delay:${delay}s" d="M${x} ${base} q-6 ${-h / 2} 4 ${-h}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }

    function shallowsBottom() {
        const r = rng(61);
        let s = `<path d="M0 150 Q100 135 200 148 T400 145 T600 150 T800 142 V200 H0 Z" fill="#f0dca0"/>`;
        for (let i = 0; i < 10; i++) s += `<path d="M${i * 80 + 10} ${170 + (i % 3) * 8} q15 -5 30 0" stroke="#d9c180" stroke-width="2" fill="none"/>`;
        // Морська трава
        for (let i = 0; i < 18; i++) s += seaGrass(20 + i * 45 + r() * 20, 152, 30 + r() * 40, i % 2 ? "#3fae7a" : "#2f8f5a", (r() * 4).toFixed(2));
        // Корали
        s += `<circle cx="140" cy="140" r="24" fill="#ff7fb0"/><path d="M122 138 q8 -8 16 0 t16 0 M124 148 q8 -8 16 0 t14 0" stroke="#d94f86" stroke-width="3" fill="none"/>`;
        s += `<rect x="620" y="110" width="8" height="40" fill="#e0884a"/><ellipse cx="624" cy="110" rx="46" ry="10" fill="#ff9f43"/>`;
        s += `<circle cx="690" cy="146" r="14" fill="#b28dff"/><circle cx="705" cy="150" r="10" fill="#9f74f5"/>`;
        s += `<ellipse cx="250" cy="152" rx="30" ry="12" fill="#8a9aa6"/><ellipse cx="560" cy="150" rx="24" ry="10" fill="#7d8c97"/>`;
        // Рятувальна капсула
        s += `<g transform="translate(340 92) rotate(-6)">
                <rect x="0" y="0" width="130" height="56" rx="28" fill="#f2f4f5" stroke="#9aa7b0" stroke-width="3"/>
                <rect x="6" y="22" width="118" height="10" fill="#ff7a1a"/>
                <circle cx="96" cy="16" r="9" fill="#6fd3ff" stroke="#9aa7b0" stroke-width="3"/>
                <rect x="40" y="-10" width="30" height="12" rx="4" fill="#d6dde2" stroke="#9aa7b0" stroke-width="2"/>
                <rect x="20" y="-22" width="3" height="22" fill="#9aa7b0"/>
                <circle class="sc-blink" cx="21.5" cy="-24" r="4" fill="#ff3b3b"/>
              </g>`;
        return s;
    }

    function kelpBottom() {
        const r = rng(67);
        let s = `<path d="M0 220 Q120 205 240 216 T480 212 T800 210 V240 H0 Z" fill="#0a3a30"/>`;
        for (let i = 0; i < 12; i++) {
            const x = 20 + i * 68 + r() * 20, h = 150 + r() * 70, w = i % 2 ? 7 : 9;
            let leaves = "";
            for (let y = 20; y < h - 10; y += 28) {
                leaves += `<ellipse cx="${x + (y % 56 ? 9 : -9)}" cy="${226 - y}" rx="10" ry="4" fill="#3fae7a" transform="rotate(${y % 56 ? -30 : 30} ${x} ${226 - y})"/>`;
            }
            let seeds = "";
            if (r() < 0.6) {
                const sy = 226 - h * (0.5 + r() * 0.3);
                seeds = glowCircle(x + 6, sy, 7, "#ffb347", "sc-pulse", (r() * 2).toFixed(2)) + glowCircle(x - 5, sy + 10, 5, "#ffb347", "sc-pulse", (r() * 2).toFixed(2));
            }
            s += `<g class="sc-sway" style="animation-duration:${(5 + r() * 3).toFixed(1)}s;animation-delay:${(r() * 3).toFixed(1)}s">
                    <path d="M${x} 226 Q${x - 14} ${226 - h / 2} ${x + 4} ${226 - h}" stroke="#2f8f5a" stroke-width="${w}" fill="none" stroke-linecap="round"/>
                    ${leaves}${seeds}
                  </g>`;
        }
        return s;
    }

    function arcticTop() {
        let s = `<path class="sc-aurora" d="M0 30 Q100 5 200 28 T400 24 T600 30 T800 20 V50 Q700 60 600 48 T400 52 T200 46 T0 52 Z" fill="#7dffb2" opacity=".35"/>`;
        s += `<path class="sc-aurora" style="animation-delay:-4s" d="M0 46 Q120 30 240 44 T480 40 T800 44 V60 Q680 70 560 60 T320 64 T0 64 Z" fill="#c38dff" opacity=".28"/>`;
        // Крижаний покрив з бурульками
        s += `<path d="M0 62 H800 V82 L780 96 L760 84 L730 104 L700 86 L660 98 L630 84 L590 110 L560 86 L520 100 L480 84 L440 106 L410 86 L370 98 L330 84 L290 108 L260 86 L220 100 L180 84 L140 104 L110 86 L70 98 L40 84 L0 96 Z" fill="#f2fbff"/>`;
        s += `<path d="M0 62 H800 V70 H0 Z" fill="#ffffff"/>`;
        return s;
    }

    function arcticBottom() {
        let s = `<polygon points="60,200 110,90 150,120 200,60 260,200" fill="#cfefff" opacity=".8"/>`;
        s += `<polygon points="200,60 260,200 230,200 190,110" fill="#a5d6f2" opacity=".8"/>`;
        s += `<polygon points="520,200 580,100 620,130 680,70 740,200" fill="#cfefff" opacity=".75"/>`;
        s += `<polygon points="680,70 740,200 700,200 660,120" fill="#a5d6f2" opacity=".75"/>`;
        s += `<path d="M0 170 Q120 160 240 172 T480 168 T800 170 V200 H0 Z" fill="#f7fdff"/>`;
        s += `<polygon points="380,170 392,110 404,170" fill="#e6f7ff"/><polygon points="410,170 418,130 426,170" fill="#e6f7ff"/>`;
        return s;
    }

    function deepBottom() {
        const r = rng(71);
        let s = `<path d="M0 200 Q200 185 400 196 T800 190 V200 Z" fill="#06202a"/>`;
        s += `<rect class="sc-pulse" x="0" y="186" width="800" height="14" fill="#3cff9a" opacity=".25"/>`;
        // Ребра велетенського скелета
        for (let i = 0; i < 6; i++) s += `<path d="M${60 + i * 26} 190 q-10 -60 20 -90" stroke="#a8d8cf" stroke-width="5" fill="none" opacity=".22"/>`;
        s += `<path d="M50 100 Q140 80 230 100" stroke="#a8d8cf" stroke-width="7" fill="none" opacity=".22"/>`;
        // Світне дерево
        s += `<path d="M420 200 C410 150 430 120 400 80 M410 120 C450 100 480 90 520 60 M405 100 C370 80 340 70 300 50 M418 150 C470 140 520 130 560 110" stroke="#0b3a48" stroke-width="10" fill="none" stroke-linecap="round"/>`;
        for (let i = 0; i < 22; i++) {
            const x = 290 + r() * 280, y = 40 + r() * 90;
            s += glowCircle(x.toFixed(0), y.toFixed(0), 3 + r() * 3, i % 3 ? "#3cf2ff" : "#7dff8a", "sc-pulse", (r() * 3).toFixed(2));
        }
        return s;
    }

    // Силует левіафана для «Глибин» (дивиться ліворуч)
    const LEVIATHAN = `<svg width="320" height="90" viewBox="0 0 320 90" aria-hidden="true">
        <path d="M8 44 C40 22 90 26 130 36 C180 48 230 30 314 42 C230 54 180 66 130 52 C90 44 40 64 8 44 Z" fill="#0a2230" opacity=".75"/>
        <path d="M120 38 l26 -26 l6 30 Z M200 40 l22 -22 l4 26 Z M150 52 l20 26 l4 -26 Z" fill="#0a2230" opacity=".75"/>
        <path d="M10 42 l-8 -10 M10 46 l-8 10" stroke="#0a2230" stroke-width="4" opacity=".75"/>
        <circle cx="26" cy="40" r="3" fill="#ffcf6b"/>
      </svg>`;

    // ---------- Кіно й мультики ----------
    function flower(x, y, rad, color) {
        let s = "";
        for (let i = 0; i < 5; i++) {
            const a = i * Math.PI * 2 / 5;
            s += `<circle cx="${(x + Math.cos(a) * rad).toFixed(1)}" cy="${(y + Math.sin(a) * rad).toFixed(1)}" r="${rad * 0.75}" fill="${color}"/>`;
        }
        return `<g opacity=".55" stroke="#ffffff" stroke-width="2">${s}<circle cx="${x}" cy="${y}" r="${rad * 0.6}" fill="#ffffff" opacity=".5"/></g>`;
    }

    function spongeTop() {
        const r = rng(79), colors = ["#c9f1ff", "#ffc6e7", "#e2f7a8", "#b9e3ff", "#ffe3a8"];
        let s = "";
        for (let i = 0; i < 12; i++) s += flower(Math.round(r() * 800), Math.round(10 + r() * 130), 10 + r() * 14, colors[i % colors.length]);
        return drift(s, 140);
    }

    function spongeBottom() {
        let s = `<path d="M0 160 Q150 150 300 162 T600 158 T800 160 V200 H0 Z" fill="#f3d98b"/>`;
        for (let i = 0; i < 16; i++) s += `<ellipse cx="${30 + i * 50}" cy="${175 + (i % 3) * 8}" rx="6" ry="3" fill="#dcc070"/>`;
        // Будинок-ананас
        s += `<defs><clipPath id="pineClip"><ellipse cx="250" cy="110" rx="44" ry="56"/></clipPath></defs>`;
        s += `<path d="M250 56 l-30 -34 l22 22 l-4 -36 l12 34 l12 -34 l-4 36 l22 -22 z" fill="#3f9b3f"/>`;
        s += `<ellipse cx="250" cy="110" rx="44" ry="56" fill="#f7a21b"/>`;
        s += `<g clip-path="url(#pineClip)" stroke="#c9770d" stroke-width="3">` +
             Array.from({ length: 9 }, (_, i) => `<line x1="${190 + i * 16}" y1="50" x2="${150 + i * 16}" y2="170"/><line x1="${150 + i * 16}" y1="50" x2="${190 + i * 16}" y2="170"/>`).join("") + `</g>`;
        s += `<path d="M236 166 v-24 a14 14 0 0 1 28 0 v24 z" fill="#8fa6b8" stroke="#5f7486" stroke-width="3"/>`;
        s += `<circle cx="232" cy="100" r="9" fill="#6fd3ff" stroke="#5f7486" stroke-width="3"/><circle cx="268" cy="122" r="8" fill="#6fd3ff" stroke="#5f7486" stroke-width="3"/>`;
        // Будинок-голова з острова
        s += `<path d="M380 166 V70 q0 -20 26 -20 h12 q26 0 26 20 V166 Z" fill="#7f93a8"/>`;
        s += `<rect x="388" y="78" width="50" height="8" fill="#5f7486"/><rect x="406" y="86" width="14" height="40" fill="#6c8096"/>`;
        s += `<circle cx="396" cy="98" r="7" fill="#6fd3ff" stroke="#5f7486" stroke-width="3"/><circle cx="430" cy="98" r="7" fill="#6fd3ff" stroke="#5f7486" stroke-width="3"/>`;
        s += `<rect x="404" y="140" width="18" height="26" fill="#5f7486"/>`;
        // Камінь-будинок
        s += `<path d="M520 166 a50 34 0 0 1 100 0 Z" fill="#8a5a3c"/><rect x="568" y="104" width="3" height="30" fill="#6b4220"/><path d="M560 104 h20" stroke="#6b4220" stroke-width="3"/>`;
        return s;
    }

    const JELLY = `<svg width="46" height="60" viewBox="0 0 46 60" aria-hidden="true">
        <path d="M3 24 a20 20 0 0 1 40 0 q-10 6 -20 0 q-10 6 -20 0z" fill="#ff8fd1" opacity=".85"/>
        <circle cx="16" cy="16" r="4" fill="#ffd0ee"/>
        <path d="M10 26 q-4 10 2 18 t0 14 M23 26 q4 10 -2 18 t2 14 M36 26 q-4 10 2 18 t-2 14" stroke="#ff8fd1" stroke-width="3" fill="none" opacity=".8"/>
      </svg>`;

    function godzillaTop() {
        return `<circle cx="640" cy="54" r="30" fill="#eef3ff" opacity=".9"/><circle cx="630" cy="48" r="6" fill="#d5dcef"/><circle cx="650" cy="64" r="4" fill="#d5dcef"/>` +
               drift(`<ellipse cx="140" cy="70" rx="90" ry="14" fill="#16284f" opacity=".7"/><ellipse cx="480" cy="40" rx="70" ry="10" fill="#16284f" opacity=".6"/>`, 150);
    }

    function godzillaBottom() {
        const r = rng(89);
        let s = "";
        // Прожектори
        [[180, -1], [640, 1]].forEach(([x], i) => {
            s += `<polygon class="sc-beam" style="animation-delay:${i * -4}s" points="${x - 6},300 ${x + 6},300 ${x + 70},0 ${x - 70},0" fill="#dff3ff" opacity=".08"/>`;
        });
        // Силует велетенського ящера за будинками (праворуч, щоб не ховався за карткою)
        s += `<g transform="translate(170 0)">`;
        s += `<path d="M430 120 q8 -20 36 -18 q18 2 22 16 l-10 6 q10 12 4 24 q22 12 34 44 q24 6 32 34 q12 34 12 74 h-160 q6 -64 26 -90 q-16 -8 -16 -24 l16 -6 q-6 -26 4 -50 q-14 -4 -14 -14 z" fill="#0a1020"/>`;
        s += `<path d="M580 280 q60 -10 90 -50 q-30 30 -90 30 z" fill="#0a1020"/>`;
        [[494, 128], [508, 150], [522, 176], [538, 204], [552, 232]].forEach(([x, y], i) => {
            s += `<polygon class="sc-pulse" style="animation-delay:${i * 0.15}s" points="${x},${y} ${x + 22},${y - 10} ${x + 8},${y + 16}" fill="#5fd0ff"/>`;
        });
        s += `<circle cx="452" cy="112" r="3" fill="#ffd86b"/>`;
        s += `</g>`;
        // Будинки з вікнами
        let x = 0;
        while (x < 800) {
            const w = 40 + Math.floor(r() * 4) * 12, h = 70 + Math.floor(r() * 9) * 14;
            s += `<rect x="${x}" y="${300 - h}" width="${w}" height="${h}" fill="${r() < 0.5 ? "#0b1226" : "#0e1730"}"/>`;
            for (let wy = 300 - h + 10; wy < 290; wy += 14) {
                for (let wx = x + 6; wx < x + w - 8; wx += 12) {
                    if (r() < 0.32) s += `<rect ${r() < 0.15 ? 'class="sc-flicker"' : ""} x="${wx}" y="${wy}" width="6" height="7" fill="#ffd86b" opacity=".85"/>`;
                }
            }
            x += w + 4;
        }
        return s;
    }

    function predatorTop() {
        let s = "";
        for (let i = 0; i < 14; i++) {
            const x = i * 60 + (i % 2) * 20;
            s += `<path class="sc-sway" style="animation-delay:${(i * 0.4).toFixed(1)}s" d="M${x} 0 q${-20 + (i % 3) * 10} 40 ${10} ${70 + (i % 4) * 15}" stroke="#2a1a6e" stroke-width="4" fill="none"/>`;
            s += `<ellipse cx="${x + 20}" cy="${10 + (i % 3) * 8}" rx="40" ry="16" fill="${i % 2 ? "#3b2490" : "#2a1a6e"}" transform="rotate(${i % 2 ? 20 : -20} ${x + 20} ${10 + (i % 3) * 8})"/>`;
        }
        s += `<g opacity=".08">` + Array.from({ length: 40 }, (_, i) => `<rect x="0" y="${i * 4}" width="800" height="1" fill="#fff"/>`).join("") + `</g>`;
        return s;
    }

    function predatorBottom() {
        let s = "";
        [[60, 1], [220, -1], [420, 1], [600, 1], [740, -1]].forEach(([x, d], i) => {
            s += `<path d="M${x} 200 q${d * 10} -80 ${d * -6} -150" stroke="#3b2490" stroke-width="12" fill="none"/>`;
            for (let k = 0; k < 5; k++) {
                const a = -70 + k * 35;
                s += `<ellipse class="sc-sway" style="animation-delay:${(i + k) * 0.3}s" cx="${x + d * -6 + Math.cos(a * Math.PI / 180) * 34}" cy="${52 + Math.sin(a * Math.PI / 180) * 18}" rx="38" ry="10" fill="#5a1a8c" transform="rotate(${a} ${x} 52)"/>`;
            }
        });
        for (let i = 0; i < 9; i++) {
            s += `<ellipse cx="${i * 95 + 30}" cy="${185 - (i % 2) * 10}" rx="70" ry="26" fill="${i % 2 ? "#d1263a" : "#ff7a2a"}" opacity=".7"/>`;
        }
        return s;
    }

    const TRIAD = `<svg width="44" height="40" viewBox="0 0 44 40" aria-hidden="true">
        <g fill="#ff1a1a"><circle cx="22" cy="6" r="4"/><circle cx="8" cy="32" r="4"/><circle cx="36" cy="32" r="4"/></g>
        <g fill="#ff1a1a" opacity=".3"><circle cx="22" cy="6" r="9"/><circle cx="8" cy="32" r="9"/><circle cx="36" cy="32" r="9"/></g>
      </svg>`;

    function alienTop() {
        let s = `<rect x="0" y="0" width="800" height="70" fill="#0d1410"/>`;
        [12, 34].forEach(y => {
            s += `<rect x="0" y="${y}" width="800" height="14" fill="#3a4a40"/><rect x="0" y="${y}" width="800" height="4" fill="#5a6e62"/>`;
            for (let x = 30; x < 800; x += 140) s += `<rect x="${x}" y="${y - 2}" width="10" height="18" fill="#26302a"/>`;
        });
        s += `<defs><pattern id="hazard" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="20" fill="#ffcc00"/><rect x="10" width="10" height="20" fill="#1a1a1a"/></pattern></defs>`;
        s += `<rect x="0" y="56" width="800" height="12" fill="url(#hazard)"/>`;
        [120, 400, 680].forEach((x, i) => { s += `<circle class="sc-blink" style="animation-delay:${i * 0.4}s" cx="${x}" cy="80" r="5" fill="#ff3b3b"/>`; });
        return s;
    }

    function alienBottom() {
        let s = `<rect x="0" y="160" width="800" height="40" fill="#0d1410"/>`;
        for (let x = 0; x < 800; x += 16) s += `<rect x="${x}" y="160" width="2" height="40" fill="#1f2b24"/>`;
        s += `<rect x="0" y="160" width="800" height="3" fill="#2a3a30"/>`;
        // Яйця з зеленим туманом
        [[90, 0], [170, 1], [610, 2], [700, 3]].forEach(([x, i]) => {
            s += `<ellipse class="sc-pulse" style="animation-delay:${i * 0.6}s" cx="${x}" cy="160" rx="50" ry="12" fill="#5dff7a" opacity=".18"/>`;
            s += `<ellipse cx="${x}" cy="138" rx="20" ry="26" fill="#3d4a3a"/>`;
            s += `<path d="M${x - 12} 130 q12 -6 24 0 M${x - 14} 142 q14 -6 28 0" stroke="#2b352a" stroke-width="2" fill="none"/>`;
            s += `<path d="M${x} 112 v10 M${x - 8} 116 l16 4" stroke="#1a2119" stroke-width="3"/>`;
        });
        // Датчик руху
        s += `<g transform="translate(400 150)">
                <circle r="64" fill="#04140a" stroke="#2aff6a" stroke-width="3"/>
                <circle r="44" fill="none" stroke="#2aff6a" stroke-width="1" opacity=".5"/>
                <circle r="24" fill="none" stroke="#2aff6a" stroke-width="1" opacity=".5"/>
                <g class="sc-sweep"><path d="M0 0 L0 -64 A64 64 0 0 1 45 -45 Z" fill="#2aff6a" opacity=".3"/></g>
                <circle class="sc-blink" cx="-20" cy="-36" r="4" fill="#9dff9d"/>
                <circle class="sc-blink" style="animation-delay:.6s" cx="28" cy="-20" r="4" fill="#9dff9d"/>
              </g>`;
        return s;
    }

    // ---------- Список тем ----------
    const GRASS = { block: "#8b5a2b", top: "#5fa83a" };
    const BUBBLE = { bubble: true };

    window.THEME_GROUPS = [
        { id: "minecraft",  title: "⛏️ Майнкрафт", prefix: "Майнкрафт" },
        { id: "subnautica", title: "🌊 Subnautica", prefix: "Subnautica" },
        { id: "movies",     title: "🎬 Кіно й мультики" }
    ];

    window.THEMES = [
        // ⛏️ Майнкрафт
        {
            id: "mc-plains", group: "minecraft", name: "Рівнини", need: 0,
            bg: "linear-gradient(to bottom,#79b8ff,#cfe8ff)",
            themeColor: "#79b8ff", onBg: "#ffffff",
            strip: "repeating-linear-gradient(90deg,rgba(0,0,0,.12) 0 6px,transparent 6px 14px),linear-gradient(#5fa83a 0 7px,#8b5a2b 7px)",
            scene: { top: plainsTop(), bottom: plainsBottom() },
            floaters: [GRASS, { block: "#2f7d32" }, "🌼", GRASS, { block: "#9a9a9a" }, "🦋"],
            passers: [
                { emoji: "🐄", size: 44, y: [86, 90], dur: 30, every: 26 },
                { emoji: "🐑", size: 40, y: [86, 90], dur: 34, every: 30 },
                { emoji: "🐝", size: 26, y: [4, 12], dur: 14, every: 18, bob: 30 }
            ],
            runner: "🐷", goal: "🥕"
        },
        {
            id: "mc-desert", group: "minecraft", name: "Пустеля", need: 6,
            bg: "linear-gradient(to bottom,#ffcf7a,#fff0cc)",
            themeColor: "#ffcf7a", onBg: "#6e5216",
            strip: "repeating-linear-gradient(90deg,#d9772b 0 10px,#e8d49a 10px 20px,#3f7fbf 20px 30px,#e8d49a 30px 40px)",
            scene: { top: desertTop(), bottom: desertBottom() },
            floaters: [{ block: "#e8d49a" }, "🌵", { block: "#d6bd7a", top: "#ecdcaa" }, { block: "#c9a55a" }],
            passers: [
                { emoji: "🐪", size: 46, y: [85, 89], dur: 36, every: 28 },
                { emoji: "🦂", size: 26, y: [90, 93], dur: 22, every: 34 }
            ],
            runner: "🐪", goal: "🌵"
        },
        {
            id: "mc-cave", group: "minecraft", name: "Печера", need: 15,
            bg: "linear-gradient(to bottom,#3a3a3a,#262626 60%,#161616)",
            themeColor: "#333333", onBg: "#d6d6d6",
            strip: "radial-gradient(circle at 20% 50%,#5ff2f2 0 2px,transparent 3px) 0 0/40px 12px,radial-gradient(circle at 70% 40%,#f2c94c 0 2px,transparent 3px) 0 0/52px 12px,#7a7a7a",
            scene: { top: caveTop(), bottom: caveBottom() },
            floaters: [
                { block: "#7a7a7a", ore: "#5ff2f2" }, { block: "#7a7a7a", ore: "#f2c94c" }, { glow: "#ffb84d" },
                { block: "#7a7a7a", ore: "#e23b3b" }, { block: "#7a7a7a", ore: "#43d16b" }
            ],
            passers: [
                { emoji: "🦇", size: 30, y: [10, 18], dur: 10, every: 16, bob: 24 },
                { emoji: "🕷️", size: 28, y: [86, 90], dur: 26, every: 30 }
            ],
            runner: "⛏️", goal: "💎"
        },
        {
            id: "mc-nether", group: "minecraft", name: "Незер", need: 26,
            bg: "linear-gradient(to bottom,#3d0b0b 0%,#6e1a12 60%,#a8300e 100%)",
            themeColor: "#3d0b0b", onBg: "#ffe0c2",
            strip: "repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 5px,transparent 5px 12px),linear-gradient(#7a2f2f 0 6px,#ff7a00 6px)",
            scene: { top: netherTop(), bottom: netherBottom() },
            floaters: [{ block: "#7a2f2f" }, { glow: "#ff8a00" }, "🔥", { block: "#ff7a00", ore: "#ffd000" }, { glow: "#ff5a00" }],
            passers: [
                { emoji: "👻", size: 56, y: [12, 22], dur: 28, every: 30, bob: 20 },
                { emoji: "🔥", size: 26, y: [40, 70], dur: 12, every: 20, bob: 40 }
            ],
            runner: "🐗", goal: "🟪"
        },
        {
            id: "mc-end", group: "minecraft", name: "Енд", need: 40,
            bg: "radial-gradient(ellipse at 50% 25%,#2e1b45,#0b0614 70%)",
            themeColor: "#120a1f", onBg: "#e8dcff",
            strip: "repeating-linear-gradient(90deg,#e6e2a8 0 8px,#d4cf8a 8px 16px)",
            scene: { top: endTop(), bottom: endBottom() },
            floaters: [{ block: "#e6e2a8" }, { glow: "#c77dff" }, { block: "#1e1028", ore: "#c77dff" }, "✨"],
            passers: [
                { emoji: "🐉", size: 64, y: [6, 16], dur: 18, every: 24, bob: 30 }
            ],
            runner: "🐉", goal: "🥚"
        },

        // 🌊 Subnautica
        {
            id: "sn-shallows", group: "subnautica", name: "Мілини", need: 4,
            bg: "linear-gradient(to bottom,#8ff3ff 0%,#2cc4d8 45%,#0d86ad 100%)",
            themeColor: "#8ff3ff", onBg: "#ffffff",
            strip: "radial-gradient(circle at 50% 0,#8ff3ff 0 7px,#2cc4d8 8px) 0 0/16px 12px",
            scene: { top: shallowsTop(), bottom: shallowsBottom() },
            floaters: [BUBBLE, "🐠", BUBBLE, "🐚", { glow: "#ff8fd1" }, BUBBLE],
            passers: [
                { emoji: "🐢", size: 44, y: [30, 60], dur: 30, every: 26, bob: 20 },
                { emoji: "🐟🐟🐟", size: 22, y: [20, 70], dur: 14, every: 14, bob: 30 }
            ],
            runner: "🤿", goal: "🐚"
        },
        {
            id: "sn-kelp", group: "subnautica", name: "Ліс водоростей", need: 12,
            bg: "linear-gradient(to bottom,#46c9a6 0%,#18785e 55%,#0a3a30 100%)",
            themeColor: "#46c9a6", onBg: "#d8fff0",
            strip: "repeating-linear-gradient(90deg,#2f8f5a 0 4px,#46c9a6 4px 10px)",
            scene: { top: lightRays("#e8fff4", 0.1), bottom: kelpBottom(), bottomVB: 240, bottomH: 40 },
            floaters: [BUBBLE, { glow: "#ffb347" }, "🐟", { glow: "#ffb347" }, BUBBLE],
            passers: [
                { emoji: "🐠🐠", size: 26, y: [20, 70], dur: 16, every: 16, bob: 24 },
                { emoji: "🐡", size: 34, y: [30, 60], dur: 24, every: 30, bob: 16 }
            ],
            runner: "🐟", goal: "🌿"
        },
        {
            id: "sn-arctic", group: "subnautica", name: "Арктика", need: 22,
            bg: "linear-gradient(to bottom,#1d3b66 0%,#5fb0e0 30%,#3a8bc2 100%)",
            themeColor: "#1d3b66", onBg: "#ffffff",
            strip: "linear-gradient(#ffffff 0 5px,#a5dbf6 5px)",
            scene: { top: arcticTop(), bottom: arcticBottom() },
            floaters: ["❄️", BUBBLE, "🐧", "🧊", BUBBLE], floaterColor: "#ffffff",
            passers: [
                { emoji: "🦭", size: 46, y: [40, 70], dur: 26, every: 24, bob: 20 },
                { emoji: "🐧", size: 34, y: [30, 70], dur: 16, every: 20, bob: 30 }
            ],
            runner: "🐧", goal: "🧊"
        },
        {
            id: "sn-deep", group: "subnautica", name: "Глибини", need: 35,
            bg: "radial-gradient(ellipse at 50% 0%,#0f3a5a,#03111f 65%,#000000 100%)",
            themeColor: "#03111f", onBg: "#9ff7ff",
            strip: "radial-gradient(circle,#3cf2ff 0 2px,transparent 3px) 0 0/22px 12px,#03111f",
            scene: { top: "", bottom: deepBottom() },
            floaters: [{ glow: "#3cf2ff" }, { glow: "#7dff8a" }, "🦑", { glow: "#b28dff" }, BUBBLE, { glow: "#3cf2ff" }],
            passers: [
                { svg: LEVIATHAN, y: [20, 50], dur: 40, every: 36, bob: 30 },
                { emoji: "🐙", size: 34, y: [60, 80], dur: 26, every: 30, bob: 20 }
            ],
            runner: "🦑", goal: "🔦"
        },

        // 🎬 Кіно й мультики
        {
            id: "spongebob", group: "movies", name: "Губка Боб", need: 2,
            bg: "linear-gradient(to bottom,#5fd3ff,#2fa4e7)",
            themeColor: "#5fd3ff", onBg: "#5a4310",
            strip: "radial-gradient(circle,#c9a800 0 3px,transparent 4px) 0 0/18px 12px,#ffe94d",
            scene: { top: spongeTop(), bottom: spongeBottom() },
            floaters: [BUBBLE, "🌸", BUBBLE, "🌼", BUBBLE],
            passers: [
                { svg: JELLY, y: [10, 50], dur: 22, every: 14, bob: 40 },
                { emoji: "🦀", size: 34, y: [88, 92], dur: 20, every: 24 }
            ],
            runner: "🧽", goal: "🍔"
        },
        {
            id: "godzilla", group: "movies", name: "Ґодзілла", need: 9,
            bg: "linear-gradient(to bottom,#0c1b3a,#24467d 75%,#0a0f1f)",
            themeColor: "#0c1b3a", onBg: "#bfe6ff",
            strip: "linear-gradient(90deg,#24467d,#5fd0ff,#24467d)",
            scene: { top: godzillaTop(), bottom: godzillaBottom(), bottomVB: 300, bottomH: 46 },
            floaters: [{ glow: "#4fc3ff" }, "⚡", { glow: "#4fc3ff" }, { glow: "#8fe3ff" }],
            passers: [
                { emoji: "🚁", size: 34, y: [6, 14], dur: 16, every: 20, bob: 10 },
                { emoji: "✈️", size: 26, y: [4, 10], dur: 12, every: 34 }
            ],
            runner: "🦖", goal: "🏙️"
        },
        {
            id: "predator", group: "movies", name: "Хижак", need: 18,
            bg: "linear-gradient(to bottom,#1b0b4d 0%,#5a1a8c 35%,#d1263a 70%,#ffb300 100%)",
            themeColor: "#1b0b4d", onBg: "#fff3d6",
            strip: "linear-gradient(90deg,#1b0b4d,#5a1a8c,#d1263a,#ffb300,#d1263a,#5a1a8c)",
            scene: { top: predatorTop(), bottom: predatorBottom() },
            floaters: [{ glow: "#ff1a1a" }, "🌴", { glow: "#ff1a1a" }, "🌿"],
            passers: [
                { svg: TRIAD, y: [20, 70], dur: 18, every: 18, bob: 60 },
                { emoji: "🦜", size: 30, y: [8, 16], dur: 12, every: 26, bob: 20 }
            ],
            runner: "🏃", goal: "🚁"
        },
        {
            id: "alien", group: "movies", name: "Чужий", need: 30,
            bg: "linear-gradient(to bottom,#0b1a10,#030805)",
            themeColor: "#0b1a10", onBg: "#7dff9a",
            strip: "repeating-linear-gradient(45deg,#ffcc00 0 10px,#1a1a1a 10px 20px)",
            scene: { top: alienTop(), bottom: alienBottom() },
            floaters: [{ glow: "#5dff7a" }, "👾", { glow: "#5dff7a" }, { glow: "#b6ff3c" }],
            passers: [
                { emoji: "🛸", size: 40, y: [16, 30], dur: 14, every: 26, bob: 20 }
            ],
            runner: "🧑‍🚀", goal: "🚀"
        }
    ];
})();
