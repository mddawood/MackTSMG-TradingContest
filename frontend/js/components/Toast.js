// Toast Notification Component

export function showToast(message, type = 'success') {
    let toast = document.getElementById('toast-notification');
    let toastMsg = document.getElementById('toast-message');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast hidden';
        toastMsg = document.createElement('span');
        toastMsg.id = 'toast-message';
        toast.appendChild(toastMsg);
        document.body.appendChild(toast);
    }

    toastMsg.textContent = message;
    toast.className = 'toast'; // reset classes

    if (type === 'error') {
        toast.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        toast.style.boxShadow = '0 10px 35px rgba(239, 68, 68, 0.15)';
    } else {
        toast.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        toast.style.boxShadow = '0 10px 35px rgba(16, 185, 129, 0.15)';
    }

    toast.classList.remove('hidden');

    if (window._toastTimeout) {
        clearTimeout(window._toastTimeout);
    }

    window._toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
