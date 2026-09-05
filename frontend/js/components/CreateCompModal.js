// Admin Create Competition Modal Component
import { adminAPI } from '../api.js';
import { showToast } from './Toast.js';

let compCreatedCallback = null;

export function initCreateCompModal({ onCompetitionCreated }) {
    compCreatedCallback = onCompetitionCreated;

    const compModal = document.getElementById('comp-modal');
    const compModalCloseBtn = document.getElementById('comp-modal-close-btn');
    const compFormModal = document.getElementById('admin-comp-form-modal');

    if (compModalCloseBtn) {
        compModalCloseBtn.addEventListener('click', closeCreateCompModal);
    }

    if (compModal) {
        compModal.addEventListener('click', (e) => {
            if (e.target === compModal) closeCreateCompModal();
        });
    }

    if (compFormModal) {
        compFormModal.addEventListener('submit', handleCreateCompetition);
    }
}

export function openCreateCompModal() {
    const compModal = document.getElementById('comp-modal');
    if (compModal) {
        compModal.classList.remove('hidden');
    }
}

export function closeCreateCompModal() {
    const compModal = document.getElementById('comp-modal');
    const compFormModal = document.getElementById('admin-comp-form-modal');

    if (compModal) compModal.classList.add('hidden');
    if (compFormModal) compFormModal.reset();
}

async function handleCreateCompetition(e) {
    e.preventDefault();
    const title = document.getElementById('modal-comp-title').value;
    const description = document.getElementById('modal-comp-desc').value;
    const startTimeVal = document.getElementById('modal-comp-start').value;
    const endTimeVal = document.getElementById('modal-comp-end').value;
    const submitBtn = document.getElementById('modal-comp-submit-btn');

    const start_time = new Date(startTimeVal).toISOString();
    const end_time = new Date(endTimeVal).toISOString();

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Launching...';
    submitBtn.disabled = true;

    try {
        await adminAPI.createCompetition({ title, description, start_time, end_time });

        showToast('Competition created and launched successfully!', 'success');
        closeCreateCompModal();

        if (compCreatedCallback) {
            await compCreatedCallback();
        }
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
