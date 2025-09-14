// Load saved form data
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('actividad-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const saved = localStorage.getItem(`actividad_${input.name}`);
        if (saved) input.value = saved;
        input.addEventListener('input', () => {
            localStorage.setItem(`actividad_${input.name}`, input.value);
        });
    });
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

document.getElementById('actividad-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/api/actividad', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('preview-content').innerHTML = marked.parse(data.markdown);
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
    a.download = 'actividad.md';
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
    document.getElementById('actividad-form').dispatchEvent(new Event('submit'));
});