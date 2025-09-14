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

document.getElementById('convertir-form').addEventListener('submit', async (e) => {
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
        } else {
            alert('Error al convertir el archivo');
        }
    } catch (error) {
        alert('Error de conexión');
    } finally {
        hideLoading();
    }
});