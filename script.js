// Hilfsfunktionen für Zeit-only (MS seit Mitternacht)
function parseTimeToMs(value) {
    if (!value) return null;
    // value ist "HH:MM" oder "HH:MM:SS"
    const parts = value.split(':').map(n => parseInt(n, 10));
    if (parts.length < 2) return null;
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
    return ((h * 3600) + (m * 60) + s) * 1000;
}

function msToParts(ms) {
    const abs = Math.abs(ms);
    const hours = Math.floor(abs / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);
    return { hours, minutes, seconds, negative: ms < 0 };
}

function formatParts(p) {
    const parts = [];
    if (p.hours > 0) parts.push(p.hours + (p.hours === 1 ? ' Std.' : ' Std.'));
    if (p.minutes > 0) parts.push(p.minutes + (p.minutes === 1 ? ' Min.' : ' Min.'));
    if (p.seconds > 0 || parts.length === 0) parts.push(p.seconds + (p.seconds === 1 ? ' Sek.' : ' Sek.'));
    return (p.negative ? '-' : '') + parts.join(', ');
}

function formatMsToTime(ms) {
    const total = ((ms % 86400000) + 86400000) % 86400000; // normalize
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const MAX_MS = 24 * 3600 * 1000;

// Hilfsfunktion zur Anzeige von Ergebnissen / Fehlern
function showResult(element, text, isError = false) {
    element.textContent = text;
    element.style.display = 'block';
    if (isError) {
        element.style.backgroundColor = '#fff5f5';
        element.style.color = '#c53030';
        element.style.borderColor = '#feb2b2';
    } else {
        element.style.backgroundColor = 'var(--bg-result)';
        element.style.color = 'var(--text-result)';
        element.style.borderColor = 'var(--border-result)';
    }
}

function hideResult(element) {
    element.style.display = 'none';
    element.textContent = '';
}

// Differenz berechnen
document.getElementById('calc-diff').addEventListener('click', () => {
    const startVal = document.getElementById('start-dt').value;
    const endVal = document.getElementById('end-dt').value;
    const out = document.getElementById('diff-result');
    
    const startMs = parseTimeToMs(startVal);
    const endMs = parseTimeToMs(endVal);
    
    if (startMs === null || endMs === null) {
        showResult(out, 'Bitte geben Sie sowohl eine gültige Start- als auch Endzeit ein.', true);
        return;
    }
    
    let diff = endMs - startMs;
    if (diff < 0) {
        diff += MAX_MS; // nächster Tag
    }
    
    const parts = msToParts(diff);
    let resultText = '🕒 Zeitdifferenz: ' + formatParts(parts);
    if (endMs < startMs) {
        resultText += ' (am nächsten Tag)';
    }
    showResult(out, resultText);
});

document.getElementById('clear-diff').addEventListener('click', () => {
    document.getElementById('start-dt').value = '';
    document.getElementById('end-dt').value = '';
    hideResult(document.getElementById('diff-result'));
});

// Startzeit + Dauer => Endzeit
document.getElementById('calc-add').addEventListener('click', () => {
    const startVal = document.getElementById('add-start-dt').value;
    const h = parseInt(document.getElementById('dur-hours').value || '0', 10);
    const m = parseInt(document.getElementById('dur-mins').value || '0', 10);
    const s = parseInt(document.getElementById('dur-secs').value || '0', 10);
    const out = document.getElementById('add-result');
    
    const startMs = parseTimeToMs(startVal);
    if (startMs === null) {
        showResult(out, 'Bitte geben Sie eine gültige Startzeit an.', true);
        return;
    }
    
    if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || m < 0 || s < 0) {
        showResult(out, 'Die Dauer darf keine negativen Werte enthalten.', true);
        return;
    }
    
    const addMs = ((h * 3600) + (m * 60) + s) * 1000;
    if (addMs > MAX_MS) {
        showResult(out, 'Die addierte Dauer darf höchstens 24 Stunden betragen.', true);
        return;
    }
    
    const total = startMs + addMs;
    const dayShift = Math.floor(total / MAX_MS);
    const endMs = ((total % MAX_MS) + MAX_MS) % MAX_MS;
    const timeStr = formatMsToTime(endMs);
    
    let resultText = '🎯 Endzeit: ' + timeStr;
    if (dayShift > 0) {
        resultText += ' (am nächsten Tag)';
    } else {
        resultText += ' (am selben Tag)';
    }
    showResult(out, resultText);
});

document.getElementById('clear-add').addEventListener('click', () => {
    document.getElementById('add-start-dt').value = '';
    document.getElementById('dur-hours').value = '0';
    document.getElementById('dur-mins').value = '0';
    document.getElementById('dur-secs').value = '0';
    hideResult(document.getElementById('add-result'));
});
