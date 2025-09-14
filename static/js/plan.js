// Load saved form data and attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('plan-form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'file') return;
            const saved = localStorage.getItem(`plan_${input.name}`);
            if (saved) input.value = saved;
            input.addEventListener('input', () => {
                localStorage.setItem(`plan_${input.name}`, input.value);
            });
        });
    }

    // Initialize Lucide icons for dynamic content
    lucide.createIcons();

    // Attach form submit listener
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/api/plan', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (response.ok) {
                    window.__lastMarkdown = data.markdown;
                    const preview = document.getElementById('preview');
                    if (preview) preview.innerHTML = marked.parse(data.markdown);
                    toast('Plan generado exitosamente');
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
                a.download = 'plan.md';
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
                        a.download = 'plan.pdf';
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