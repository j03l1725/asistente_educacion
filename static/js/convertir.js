document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons for dynamic content
    lucide.createIcons();

    // Attach form submit listener
    const form = document.getElementById('convertir-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            const formData = new FormData(e.target);
            try {
                const response = await fetch('/api/convert', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'converted.pdf';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast('Archivo convertido exitosamente');
                } else {
                    toast('Error al convertir el archivo');
                }
            } catch (error) {
                toast('Error de conexión');
            } finally {
                hideLoading();
            }
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