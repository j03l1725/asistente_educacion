// Load saved form data and attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calificar-form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'file') return;
            const saved = localStorage.getItem(`calificar_${input.name}`);
            if (saved) input.value = saved;
            input.addEventListener('input', () => {
                localStorage.setItem(`calificar_${input.name}`, input.value);
            });
        });
    }

    toggleContenido();
    // Initialize Lucide icons for dynamic content
    lucide.createIcons();

    // Attach tipo change listener
    const tipoSelect = document.getElementById('tipo');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', toggleContenido);
    }

    // Attach form submit listener
    if (form) {
        form.addEventListener('submit', async (e) => {
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
                    window.__lastMarkdown = data.markdown;
                    const preview = document.getElementById('preview');
                    if (preview) preview.innerHTML = `<p class="text-neon font-semibold mb-4">Puntaje total: ${data.json.total}/100</p>` + marked.parse(data.markdown);
                    toast('Evaluación completada');
                } else {
                    toast('Error: ' + data.error);
                }
            } catch (error) {
                toast('Error de conexión');
            } finally {
                hideLoading();
            }
        });
    }

    // Attach button listeners
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (window.__lastMarkdown) {
                navigator.clipboard.writeText(window.__lastMarkdown);
                toast('Copiado al portapapeles');
            } else {
                toast('No hay contenido para copiar');
            }
        });
    }

    const downloadMdBtn = document.getElementById('downloadMdBtn');
    if (downloadMdBtn) {
        downloadMdBtn.addEventListener('click', () => {
            if (window.__lastMarkdown) {
                const blob = new Blob([window.__lastMarkdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'evaluacion.md';
                a.click();
                URL.revokeObjectURL(url);
                toast('Archivo descargado');
            } else {
                toast('No hay contenido para descargar');
            }
        });
    }

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async () => {
            if (window.__lastMarkdown) {
                try {
                    const response = await fetch('/api/download_pdf', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markdown: window.__lastMarkdown })
                    });
                    if (response.ok) {
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'evaluacion.pdf';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast('PDF descargado');
                    } else {
                        toast('Error al descargar PDF');
                    }
                } catch (error) {
                    toast('Error de conexión');
                }
            } else {
                toast('No hay contenido para descargar');
            }
        });
    }

    const regenerateBtn = document.getElementById('regenerate-btn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
            if (form) form.dispatchEvent(new Event('submit'));
        });
    }
});

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'block';
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
}

function toggleContenido() {
    const tipo = document.getElementById('tipo').value;
    const textarea = document.getElementById('contenido');
    const fileInput = document.getElementById('file-input');
    if (tipo === 'archivo') {
        if (textarea) textarea.style.display = 'none';
        if (fileInput) fileInput.style.display = 'block';
    } else {
        if (textarea) textarea.style.display = 'block';
        if (fileInput) fileInput.style.display = 'none';
    }
}