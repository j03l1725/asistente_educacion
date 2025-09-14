// Load saved form data
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calificar-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type === 'file') return;
        const saved = localStorage.getItem(`calificar_${input.name}`);
        if (saved) input.value = saved;
        input.addEventListener('input', () => {
            localStorage.setItem(`calificar_${input.name}`, input.value);
        });
    });
    toggleContenido();
});

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
}

document.getElementById('tipo').addEventListener('change', toggleContenido);

function toggleContenido() {
    const tipo = document.getElementById('tipo').value;
    const textarea = document.getElementById('contenido');
    const fileInput = document.getElementById('file-input');
    if (tipo === 'archivo') {
        textarea.style.display = 'none';
        fileInput.style.display = 'block';
    } else {
        textarea.style.display = 'block';
        fileInput.style.display = 'none';
    }
}

document.getElementById('calificar-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    const rubrica = JSON.parse(document.getElementById('rubrica').value);
    const tipo = document.getElementById('tipo').value;
    const contenido = tipo === 'archivo' ? '' : document.getElementById('contenido').value;
    const metadata = document.getElementById('metadata').value;
    const evidencia = { tipo, contenido, metadata: metadata ? JSON.parse(metadata) : {} };
    document.getElementById('rubrica_json').value = JSON.stringify(rubrica);
    document.getElementById('evidencia_json').value = JSON.stringify(evidencia);
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/api/calificar', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            const preview = document.getElementById('preview-content');
            preview.innerHTML = `<p><strong>Puntaje total: ${data.json.total}/100</strong></p>` + marked.parse(data.markdown);
            window.currentMarkdown = data.markdown;
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error de conexión');
    } finally {
        hideLoading();
    }
});

document.getElementById('copy-btn').addEventListener('click', () => {
    const content = document.getElementById('preview-content').textContent;
    navigator.clipboard.writeText(content);
    alert('Copiado al portapapeles');
});

document.getElementById('download-btn').addEventListener('click', () => {
    const content = document.getElementById('preview-content').textContent;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluacion.md';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('download-pdf-btn').addEventListener('click', async () => {
    const markdown = window.currentMarkdown;
    if (!markdown) {
        alert('No hay contenido para descargar');
        return;
    }
    try {
        const response = await fetch('/api/download_pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown })
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated_content.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert('Error al descargar PDF');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

document.getElementById('regenerate-btn').addEventListener('click', () => {
    document.getElementById('calificar-form').dispatchEvent(new Event('submit'));
});