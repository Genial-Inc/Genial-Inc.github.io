/**
 * CONFIGURATION DU JEU
 */
const CONFIG = {
    MAX_DRAG_DIST: 80,      // Distance max du tirage
    SWAP_INTERVAL: 10000,   // Temps entre chaque mélange (ms)
    RETURN_TIME: 1000,      // Temps d'attente avant le retour de la clé
    ANIM_DURATION_BASE: 300 // Base de durée pour l'animation du tir
};

const SOUNDS = {
    GOOD: '/contact/resources/audio/good_throw_',
    BAD: '/contact/resources/audio/bad_throw_',
    COUNT_GOOD: 4,
    COUNT_BAD: 12,
    CARACT_SEC: '/contact/resources/audio/CaractSecs/',
    CARACT_LONG: '/contact/resources/audio/CaractLongs/',
};

function letterFilename(letter) {
    if (letter === '💣') return null;
    if (letter === '@') return 'arobase';
    if (letter === '-') return 'tiret';
    if (letter === '.') return 'point';
    return letter.toLowerCase();
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-_'.split('');
CHARACTERS.push('💣');

/**
 * ÉTAT GLOBAL
 */
const state = {
    dragging: false,
    locked: false,
    pointerId: null,
    origin: { x: 0, y: 0 },
    current: { x: 0, y: 0, angle: 0 },
    letterIndex: 0
};

/**
 * INITIALISATION
 */
document.addEventListener('DOMContentLoaded', () => {
    initLetterMenu();
    initSlingshot();
    
    // Lancer le mélange automatique
    setInterval(swapFields, CONFIG.SWAP_INTERVAL);
});

/* -------------------------------------------------------------------------- */
/* FONCTIONNALITÉS                              */
/* -------------------------------------------------------------------------- */

/**
 * Affiche l'overlay de succès (Style géré dans CSS)
 */
function envoyer() {
    const overlay = document.createElement('div');
    overlay.id = 'confirmation-overlay';
    
    overlay.innerHTML = `
        <div class="overlay-box">
            <div class="overlay-check">✓</div>
            <p class="overlay-text">Votre message a bien été envoyé!</p>
            <button class="overlay-btn" onclick="fermerTout()">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

/**
 * Mélange les champs du formulaire (Technique FLIP)
 */
function swapFields() {
    const container = document.getElementById('fields-container');
    if (!container) return;

    const groups = Array.from(container.querySelectorAll('.input-group'));
    if (groups.length < 2) return;

    // 1. Enregistrer les positions initiales
    const firstRects = new Map();
    groups.forEach(g => firstRects.set(g, g.getBoundingClientRect()));

    // 2. Mélanger le DOM
    const shuffled = groups.slice().sort(() => Math.random() - 0.5);
    shuffled.forEach(g => container.appendChild(g));

    // 3. Animer vers les nouvelles positions
    shuffled.forEach(g => {
        const first = firstRects.get(g);
        const last = g.getBoundingClientRect();
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;

        if (deltaX === 0 && deltaY === 0) return;

        // Inversion instantanée
        g.style.transition = 'none';
        g.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        g.classList.add('moving');

        // Jouer l'animation (Play)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                g.style.transition = 'transform 450ms cubic-bezier(.2,.8,.2,1)';
                g.style.transform = '';
            });
        });

        // Nettoyage après animation
        g.addEventListener('transitionend', function cleanup() {
            g.style.transition = '';
            g.classList.remove('moving');
            g.removeEventListener('transitionend', cleanup);
        }, { once: true });
    });
    
    console.log('🔄 Champs mélangés.');
}

/* -------------------------------------------------------------------------- */
/* MOTEUR LANCE-PIERRE                             */
/* -------------------------------------------------------------------------- */

function initSlingshot() {
    const key = document.getElementById('key');
    if (!key) return;

    // Gestionnaires d'événements
    key.addEventListener('pointerdown', handleDragStart);
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
    window.addEventListener('pointercancel', handleDragEnd);
}

function handleDragStart(e) {
    if (state.locked) return;
    
    const key = document.getElementById('key');
    e.preventDefault();
    key.setPointerCapture(e.pointerId);
    
    state.dragging = true;
    state.pointerId = e.pointerId;
    
    // Calcul du centre d'origine
    const rect = key.getBoundingClientRect();
    state.origin.x = rect.left + rect.width / 2;
    state.origin.y = rect.top + rect.height / 2;
    
    key.classList.add('dragging');
    key.style.transition = 'none';
}

function handleDragMove(e) {
    if (!state.dragging || e.pointerId !== state.pointerId) return;

    const dx = e.clientX - state.origin.x;
    const dy = e.clientY - state.origin.y;
    const dist = Math.hypot(dx, dy);

    // Limiter la distance max
    let x = dx;
    let y = dy;
    if (dist > CONFIG.MAX_DRAG_DIST) {
        const ratio = CONFIG.MAX_DRAG_DIST / dist;
        x = dx * ratio;
        y = dy * ratio;
    }

    // Calcul de l'angle visuel
    const angle = Math.max(-30, Math.min(30, (x / CONFIG.MAX_DRAG_DIST) * 20));
    
    state.current = { x, y, angle };
    updateKeyTransform(x, y, angle);
}

function handleDragEnd(e) {
    if (!state.dragging) return;
    if (e.pointerId !== state.pointerId) return;

    const key = document.getElementById('key');
    state.dragging = false;
    state.locked = true; // Verrouiller pendant le vol
    key.classList.remove('dragging');
    
    try { key.releasePointerCapture(state.pointerId); } catch(err) {}
    state.pointerId = null;
    
    lancerLaCle();
}

function lancerLaCle() {
    const key = document.getElementById('key');
    const letter = CHARACTERS[state.letterIndex];
    
    // Play audio
    const filename = letterFilename(letter);
    if (filename !== null) {
        const throwSound = new Audio(SOUNDS.CARACT_LONG + filename + '.mp3');
        throwSound.play();
    }
    
    // Calcul de la trajectoire
    const absX = state.origin.x + state.current.x;
    const absY = state.origin.y + state.current.y;
    
    // Calculer la destination opposée
    const distanceToTopCenter = Math.hypot(absX - window.innerWidth / 2, absY); // Distance approx vers le haut
    const currentDist = Math.hypot(state.current.x, state.current.y);
    
    if (currentDist === 0) { resetKey(); return; } // Pas de tir si pas de mouvement

    const frac = currentDist / CONFIG.MAX_DRAG_DIST;
    const targetAbsX = absX - state.current.x * frac * (distanceToTopCenter / currentDist);
    const targetAbsY = absY - state.current.y * frac * (distanceToTopCenter / currentDist);

    const targetX = targetAbsX - state.origin.x;
    const targetY = targetAbsY - state.origin.y;

    // Calcul durée animation
    const moveDist = Math.hypot(targetX - state.current.x, targetY - state.current.y);
    const duration = CONFIG.ANIM_DURATION_BASE + (moveDist / 2);

    // Lancer !
    key.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.2,1)`;
    updateKeyTransform(targetX, targetY, 0);

    // Impact
    setTimeout(() => {
        verifierImpact(targetAbsX, targetAbsY);
        
        // Retour à la base
        setTimeout(resetKey, CONFIG.RETURN_TIME);
    }, duration);
}

function resetKey() {
    const key = document.getElementById('key');
    key.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1)';
    updateKeyTransform(0, 0, 0);
    
    setTimeout(() => {
        state.locked = false;
    }, 420);
}

function updateKeyTransform(x, y, angle) {
    const key = document.getElementById('key');
    key.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
}

/* -------------------------------------------------------------------------- */
/* LOGIQUE DU JEU                                  */
/* -------------------------------------------------------------------------- */

function verifierImpact(x, y) {
    const emailInput = document.getElementById('email');
    const letter = CHARACTERS[state.letterIndex].toLowerCase();
    
    // Fonction utilitaire de collision
    const rect = emailInput.getBoundingClientRect();
    const hit = (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

    if (hit) {
        if (letter === '💣') {
            const removeCount = Math.floor(Math.random() * 5 + 1);
            emailInput.value = emailInput.value.slice(0, Math.max(0, emailInput.value.length - removeCount));
        } else {
            emailInput.value += letter;
        }
        
        const filename = letterFilename(CHARACTERS[state.letterIndex]);
        if (filename === null) {
            playRandomSound('GOOD');
        } else {
            const letterAudio = new Audio(SOUNDS.CARACT_SEC + filename + '.mp3');
            letterAudio.play();
            
            letterAudio.addEventListener('ended', () => {
                playRandomSound('GOOD');
            });
        }
    } else {
        // 35% chance of a bad sound
        if (Math.random() < 0.35)
            setTimeout(() => playRandomSound('BAD'), 200);
    }
}

function playRandomSound(type) {
    const count = type === 'GOOD' ? SOUNDS.COUNT_GOOD : SOUNDS.COUNT_BAD;
    const prefix = type === 'GOOD' ? SOUNDS.GOOD : SOUNDS.BAD;
    const idx = Math.floor(Math.random() * count) + 1;
    new Audio(`${prefix}${idx}.mp3`).play();
}

/* -------------------------------------------------------------------------- */
/* MENU LETTRES                                 */
/* -------------------------------------------------------------------------- */

function initLetterMenu() {
    const prevBtn = document.getElementById('letter-prev');
    updateLetterDisplay();

    prevBtn.addEventListener('click', () => {
        if (state.locked) return;

        // Reculer dans l'alphabet (avec boucle)
        state.letterIndex = (state.letterIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
        updateLetterDisplay();
        
        // Animation bouton
        prevBtn.classList.remove('clicked');
        void prevBtn.offsetWidth; // Force reflow
        prevBtn.classList.add('clicked');
    });
}

function updateLetterDisplay() {
    const letter = CHARACTERS[state.letterIndex];
    const letterSpan = document.getElementById('key-letter');
    const keyImg = document.getElementById('key-img');

    if (letterSpan) {
        letterSpan.textContent = letter;
        
        // Style spécial pour la bombe
        if (letter === '💣') {
            keyImg.style.visibility = 'hidden';
            letterSpan.style.fontFamily = 'sans-serif';
            letterSpan.style.fontSize = '30pt';
        } else {
            keyImg.style.visibility = 'visible';
            letterSpan.style.fontFamily = "'Comic Sans MS', cursive";
            letterSpan.style.fontSize = '20px';
        }
    }
}