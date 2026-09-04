let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    try {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'intro') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(580, now + 0.6);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'instruction') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) {
        console.log("Audio not allowed yet");
    }
}

function skipIntro() {
    const intro = document.getElementById('fer-intro');
    if (intro) {
        intro.style.opacity = '0';
        setTimeout(() => intro.remove(), 1000);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => { playSound('intro'); }, 300);
    setTimeout(() => { skipIntro(); }, 5500);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { skipIntro(); }
});

const searchInput = document.getElementById('search-input');
const gameCards = document.querySelectorAll('.game-card');
const filterButtons = document.querySelectorAll('.filter-btn');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    gameCards.forEach(card => {
        const title = card.getAttribute('data-title');
        if (title.includes(term)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
            b.classList.remove('bg-emerald-500', 'text-gray-950', 'font-semibold');
            b.classList.add('bg-gray-900', 'text-gray-300');
        });
        btn.classList.remove('bg-gray-900', 'text-gray-300');
        btn.classList.add('bg-emerald-500', 'text-gray-950', 'font-semibold');

        const category = btn.getAttribute('data-category');
        gameCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

function openModal(modalId) {
    playSound('instruction');
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

window.onclick = function(event) {
    if (event.target.classList.contains('fixed') && event.target.classList.contains('bg-black/80') && event.target.id !== 'fer-intro') {
        event.target.classList.add('hidden');
    }
}

const feedbackForm = document.getElementById('feedback-form');
const formStatus = document.getElementById('form-status');

async function handleFormSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    if (event.target.action.includes('tu-correo-id')) {
        formStatus.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border', 'border-emerald-500/20');
        formStatus.classList.add('bg-amber-500/10', 'text-amber-400', 'border', 'border-amber-500/20');
        formStatus.innerHTML = `⚠️ Configura tu endpoint de Formspree en el atributo action del formulario para recibir los correos en <strong>cinemalaptop80@gmail.com</strong>.`;
        return;
    }

    try {
        const response = await fetch(event.target.action, {
            method: feedbackForm.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            formStatus.classList.remove('hidden', 'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20', 'bg-red-500/10', 'text-red-400', 'border-red-500/20');
            formStatus.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border', 'border-emerald-500/20');
            formStatus.innerHTML = "✅ ¡Gracias! Tu mensaje fue enviado correctamente a cinemalaptop80@gmail.com.";
            feedbackForm.reset();
        } else {
            const dataError = await response.json();
            formStatus.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20');
            formStatus.classList.add('bg-red-500/10', 'text-red-400', 'border', 'border-red-500/20');
            if (Object.hasOwn(dataError, 'errors')) {
                formStatus.innerHTML = "❌ " + dataError["errors"].map(error => error["message"]).join(", ");
            } else {
                formStatus.innerHTML = "❌ No se pudo enviar el mensaje. Inténtalo más tarde.";
            }
        }
    } catch (error) {
        formStatus.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-amber-500/10', 'text-amber-400', 'border-amber-500/20');
        formStatus.classList.add('bg-red-500/10', 'text-red-400', 'border', 'border-red-500/20');
        formStatus.innerHTML = "❌ Error de conexión. No se pudo enviar el mensaje. Inténtalo más tarde.";
    }
}

feedbackForm.addEventListener('submit', handleFormSubmit);
