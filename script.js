// Hilfsfunktionen für Zeit-only (MS seit Mitternacht)
function parseTimeToMs(value){
	if(!value) return null;
	// value ist "HH:MM" oder "HH:MM:SS"
	const parts = value.split(':').map(n=>parseInt(n,10));
	if(parts.length < 2) return null;
	const h = parts[0] || 0;
	const m = parts[1] || 0;
	const s = parts[2] || 0;
	if(isNaN(h) || isNaN(m) || isNaN(s)) return null;
	return ((h*3600) + (m*60) + s) * 1000;
}

function msToParts(ms){
	const abs = Math.abs(ms);
	const hours = Math.floor(abs / 3600000);
	const minutes = Math.floor((abs % 3600000) / 60000);
	const seconds = Math.floor((abs % 60000) / 1000);
	return {hours,minutes,seconds,negative: ms<0};
}

function formatParts(p){
	const parts = [];
	if(p.hours) parts.push(p.hours + (p.hours===1? ' Std':' Std'));
	if(p.minutes) parts.push(p.minutes + (p.minutes===1? ' Min':' Min'));
	if(p.seconds || parts.length===0) parts.push(p.seconds + (p.seconds===1? ' Sek':' Sek'));
	return (p.negative?'-':'') + parts.join(', ');
}

function formatMsToTime(ms){
	const total = ((ms % 86400000) + 86400000) % 86400000; // normalize
	const h = Math.floor(total/3600000);
	const m = Math.floor((total%3600000)/60000);
	const s = Math.floor((total%60000)/1000);
	const pad = n => String(n).padStart(2,'0');
	return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const MAX_MS = 24 * 3600 * 1000;

// Differenz berechnen (nur Uhrzeiten, max 24h). Wenn End < Start wird nächster Tag angenommen.
document.getElementById('calc-diff').addEventListener('click', ()=>{
	const startVal = document.getElementById('start-dt').value;
	const endVal = document.getElementById('end-dt').value;
	const out = document.getElementById('diff-result');
	const startMs = parseTimeToMs(startVal);
	const endMs = parseTimeToMs(endVal);
	if(startMs === null || endMs === null){ out.textContent = 'Bitte beide Uhrzeiten korrekt ausfüllen.'; return; }
	let diff = endMs - startMs;
	if(diff < 0) diff += MAX_MS; // nächster Tag
	if(diff > MAX_MS){ out.textContent = 'Differenz darf höchstens 24 Stunden betragen.'; return; }
	const parts = msToParts(diff);
	out.textContent = 'Differenz: ' + formatParts(parts);
});

document.getElementById('clear-diff').addEventListener('click', ()=>{
	document.getElementById('start-dt').value = '';
	document.getElementById('end-dt').value = '';
	document.getElementById('diff-result').textContent = '';
});

// Startzeit (time-only) + Dauer => Endzeit (time-only, ggf. nächster Tag). Dauer max 24h.
document.getElementById('calc-add').addEventListener('click', ()=>{
	const startVal = document.getElementById('add-start-dt').value;
	const h = parseInt(document.getElementById('dur-hours').value || '0',10);
	const m = parseInt(document.getElementById('dur-mins').value || '0',10);
	const s = parseInt(document.getElementById('dur-secs').value || '0',10);
	const out = document.getElementById('add-result');
	const startMs = parseTimeToMs(startVal);
	if(startMs === null){ out.textContent = 'Bitte eine Startzeit angeben.'; return; }
	if(isNaN(h) || isNaN(m) || isNaN(s) || h<0 || m<0 || s<0){ out.textContent = 'Dauer muss gültige nicht-negative Zahlen sein.'; return; }
	const addMs = ((Math.max(0,h)*3600) + (Math.max(0,m)*60) + Math.max(0,s)) * 1000;
	if(addMs > MAX_MS){ out.textContent = 'Dauer darf höchstens 24 Stunden betragen.'; return; }
	const total = startMs + addMs;
	const dayShift = Math.floor(total / MAX_MS);
	const endMs = ((total % MAX_MS) + MAX_MS) % MAX_MS;
	const timeStr = formatMsToTime(endMs);
	out.textContent = 'Endzeit: ' + timeStr + (dayShift ? ' (nächster Tag)' : ' (gleicher Tag)');
});

document.getElementById('clear-add').addEventListener('click', ()=>{
	document.getElementById('add-start-dt').value = '';
	document.getElementById('dur-hours').value = '0';
	document.getElementById('dur-mins').value = '0';
	document.getElementById('dur-secs').value = '0';
	document.getElementById('add-result').textContent = '';
});
