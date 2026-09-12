// Admin Create Competition Modal Component with ServiceNow & Salesforce style IST DateTime Pickers
import { adminAPI } from '../api.js';
import { showToast } from './Toast.js';

let compCreatedCallback = null;

const TIME_SLOTS = [
    { label: '12:00 AM (Midnight)', value: '00:00' },
    { label: '12:30 AM', value: '00:30' },
    { label: '01:00 AM', value: '01:00' },
    { label: '01:30 AM', value: '01:30' },
    { label: '02:00 AM', value: '02:00' },
    { label: '02:30 AM', value: '02:30' },
    { label: '03:00 AM', value: '03:00' },
    { label: '03:30 AM', value: '03:30' },
    { label: '04:00 AM', value: '04:00' },
    { label: '04:30 AM', value: '04:30' },
    { label: '05:00 AM', value: '05:00' },
    { label: '05:30 AM', value: '05:30' },
    { label: '06:00 AM', value: '06:00' },
    { label: '06:30 AM', value: '06:30' },
    { label: '07:00 AM', value: '07:00' },
    { label: '07:30 AM', value: '07:30' },
    { label: '08:00 AM', value: '08:00' },
    { label: '08:30 AM', value: '08:30' },
    { label: '09:00 AM', value: '09:00' },
    { label: '09:15 AM (Market Open)', value: '09:15' },
    { label: '09:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '12:00 PM (Noon)', value: '12:00' },
    { label: '12:30 PM', value: '12:30' },
    { label: '01:00 PM', value: '13:00' },
    { label: '01:30 PM', value: '13:30' },
    { label: '02:00 PM', value: '14:00' },
    { label: '02:30 PM', value: '14:30' },
    { label: '03:00 PM', value: '15:00' },
    { label: '03:30 PM (Market Close)', value: '15:30' },
    { label: '04:00 PM', value: '16:00' },
    { label: '04:30 PM', value: '16:30' },
    { label: '05:00 PM', value: '17:00' },
    { label: '05:30 PM', value: '17:30' },
    { label: '06:00 PM', value: '18:00' },
    { label: '06:30 PM', value: '18:30' },
    { label: '07:00 PM', value: '19:00' },
    { label: '07:30 PM', value: '19:30' },
    { label: '08:00 PM', value: '20:00' },
    { label: '08:30 PM', value: '20:30' },
    { label: '09:00 PM', value: '21:00' },
    { label: '09:30 PM', value: '21:30' },
    { label: '10:00 PM', value: '22:00' },
    { label: '10:30 PM', value: '22:30' },
    { label: '11:00 PM', value: '23:00' },
    { label: '11:30 PM', value: '23:30' },
    { label: '11:59 PM (End of Day)', value: '23:59' }
];

// Helper: Get current date & time object localized in IST (Asia/Kolkata)
function getNowIST() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    return {
        dateStr: `${map.year}-${map.month}-${map.day}`,
        timeStr: `${map.hour}:${map.minute}`,
        hours: parseInt(map.hour, 10),
        minutes: parseInt(map.minute, 10)
    };
}

// Helper: Format 24h HH:mm to 12h AM/PM
function format12h(time24) {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

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

    // Initialize Time Slots Popovers for both Start and End pickers
    initTimePopover('start');
    initTimePopover('end');

    // Initialize Date triggers (Calendar icon & input change listeners)
    initDateTriggers('start');
    initDateTriggers('end');

    // Global listener to close time popovers when clicking outside
    document.addEventListener('click', (e) => {
        const startContainer = document.getElementById('start-datetime-picker');
        const endContainer = document.getElementById('end-datetime-picker');

        if (startContainer && !startContainer.contains(e.target)) {
            closeTimePopover('start');
        }
        if (endContainer && !endContainer.contains(e.target)) {
            closeTimePopover('end');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTimePopover('start');
            closeTimePopover('end');
        }
    });
}

function initDateTriggers(prefix) {
    const dateInput = document.getElementById(`modal-comp-${prefix}-date`);
    const calBtn = document.getElementById(`modal-comp-${prefix}-cal-btn`);

    if (calBtn && dateInput) {
        calBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof dateInput.showPicker === 'function') {
                try {
                    dateInput.showPicker();
                } catch (err) {
                    dateInput.focus();
                }
            } else {
                dateInput.focus();
            }
        });
    }

    if (dateInput) {
        dateInput.addEventListener('change', () => {
            updatePreview(prefix);
        });
    }
}

function initTimePopover(prefix) {
    const timeInput = document.getElementById(`modal-comp-${prefix}-time`);
    const timeHidden = document.getElementById(`modal-comp-${prefix}-time-24`);
    const clockBtn = document.getElementById(`modal-comp-${prefix}-clock-btn`);
    const popover = document.getElementById(`modal-comp-${prefix}-time-popover`);
    const slotsContainer = document.getElementById(`modal-comp-${prefix}-slots`);
    const nowBtn = popover ? popover.querySelector('.snow-time-now-btn') : null;

    if (!slotsContainer) return;

    // Render preset time slots into the popover container
    slotsContainer.innerHTML = '';
    TIME_SLOTS.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'snow-time-slot';
        btn.dataset.value = slot.value;
        btn.innerHTML = `
            <span>${slot.label}</span>
            <span class="text-muted" style="font-size: 0.72rem; font-family: var(--font-mono);">${slot.value}</span>
        `;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeValue(prefix, slot.value, slot.label);
            closeTimePopover(prefix);
        });

        slotsContainer.appendChild(btn);
    });

    const togglePopover = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const otherPrefix = prefix === 'start' ? 'end' : 'start';
        closeTimePopover(otherPrefix);

        if (popover) {
            const isHidden = popover.classList.contains('hidden');
            if (isHidden) {
                popover.classList.remove('hidden');
                // Scroll to currently selected slot if any
                const currentVal = timeHidden?.value;
                if (currentVal) {
                    const match = slotsContainer.querySelector(`[data-value="${currentVal}"]`);
                    if (match) {
                        slotsContainer.querySelectorAll('.snow-time-slot').forEach(s => s.classList.remove('selected'));
                        match.classList.add('selected');
                        match.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                }
            } else {
                popover.classList.add('hidden');
            }
        }
    };

    if (clockBtn) clockBtn.addEventListener('click', togglePopover);
    if (timeInput) timeInput.addEventListener('click', togglePopover);

    if (nowBtn) {
        nowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const istNow = getNowIST();
            const dateInput = document.getElementById(`modal-comp-${prefix}-date`);
            if (dateInput) dateInput.value = istNow.dateStr;

            setTimeValue(prefix, istNow.timeStr, `${format12h(istNow.timeStr)} (Current)`);
            closeTimePopover(prefix);
        });
    }
}

function setTimeValue(prefix, value24, displayLabel) {
    const timeInput = document.getElementById(`modal-comp-${prefix}-time`);
    const timeHidden = document.getElementById(`modal-comp-${prefix}-time-24`);
    const slotsContainer = document.getElementById(`modal-comp-${prefix}-slots`);

    if (timeHidden) timeHidden.value = value24;
    if (timeInput) timeInput.value = displayLabel || format12h(value24);

    if (slotsContainer) {
        slotsContainer.querySelectorAll('.snow-time-slot').forEach(slot => {
            if (slot.dataset.value === value24) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    updatePreview(prefix);
}

function closeTimePopover(prefix) {
    const popover = document.getElementById(`modal-comp-${prefix}-time-popover`);
    if (popover) popover.classList.add('hidden');
}

function updatePreview(prefix) {
    const dateInput = document.getElementById(`modal-comp-${prefix}-date`);
    const timeHidden = document.getElementById(`modal-comp-${prefix}-time-24`);
    const previewEl = document.getElementById(`modal-comp-${prefix}-preview`);

    if (!previewEl) return;

    const dateVal = dateInput?.value;
    const timeVal = timeHidden?.value;

    if (!dateVal || !timeVal) {
        previewEl.innerHTML = `<span class="text-muted">📅 Incomplete ${prefix} date/time</span>`;
        return;
    }

    try {
        const istDateTimeStr = `${dateVal}T${timeVal}:00+05:30`;
        const dateObj = new Date(istDateTimeStr);

        const formatted = dateObj.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        previewEl.innerHTML = `
            <span style="color: #60a5fa; font-weight: 500;">
                ✓ Scheduled: <strong>${formatted} IST</strong>
            </span>
        `;
    } catch (err) {
        previewEl.innerHTML = `<span class="text-muted">📅 ${dateVal} at ${timeVal} IST</span>`;
    }
}

export function openCreateCompModal() {
    const compModal = document.getElementById('comp-modal');
    if (!compModal) return;

    compModal.classList.remove('hidden');

    // Auto-populate sensible defaults in IST:
    // Start: Today at 09:15 AM IST (Market Open)
    // End: 7 days later at 11:59 PM IST (End of Day)
    const istNow = getNowIST();
    const startDateInput = document.getElementById('modal-comp-start-date');
    if (startDateInput && !startDateInput.value) {
        startDateInput.value = istNow.dateStr;
    }
    setTimeValue('start', '09:15', '09:15 AM (Market Open)');

    // 7 days later for end date
    const endDateInput = document.getElementById('modal-comp-end-date');
    if (endDateInput && !endDateInput.value) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const futureIST = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(futureDate);
        endDateInput.value = futureIST;
    }
    setTimeValue('end', '23:59', '11:59 PM (End of Day)');

    updatePreview('start');
    updatePreview('end');
}

export function closeCreateCompModal() {
    const compModal = document.getElementById('comp-modal');
    const compFormModal = document.getElementById('admin-comp-form-modal');

    closeTimePopover('start');
    closeTimePopover('end');

    if (compModal) compModal.classList.add('hidden');
    if (compFormModal) compFormModal.reset();
}

async function handleCreateCompetition(e) {
    e.preventDefault();
    const title = document.getElementById('modal-comp-title').value.trim();
    const description = document.getElementById('modal-comp-desc').value.trim();
    const startDateVal = document.getElementById('modal-comp-start-date').value;
    const startTimeVal = document.getElementById('modal-comp-start-time-24').value;
    const endDateVal = document.getElementById('modal-comp-end-date').value;
    const endTimeVal = document.getElementById('modal-comp-end-time-24').value;
    const submitBtn = document.getElementById('modal-comp-submit-btn');

    if (!startDateVal || !startTimeVal) {
        showToast('Please select a Start Date and Time from the calendar/clock in IST.', 'error');
        return;
    }
    if (!endDateVal || !endTimeVal) {
        showToast('Please select an End Date and Time from the calendar/clock in IST.', 'error');
        return;
    }

    // Build ISO datetime strings strictly with Indian Standard Time offset (+05:30)
    const startIso = new Date(`${startDateVal}T${startTimeVal}:00+05:30`).toISOString();
    const endIso = new Date(`${endDateVal}T${endTimeVal}:00+05:30`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
        showToast('End Date & Time must be strictly after Start Date & Time.', 'error');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Launching Competition...';
    submitBtn.disabled = true;

    try {
        await adminAPI.createCompetition({
            title,
            description,
            start_time: startIso,
            end_time: endIso
        });

        showToast('Competition created & scheduled successfully in IST!', 'success');
        closeCreateCompModal();

        if (compCreatedCallback) {
            await compCreatedCallback();
        }
    } catch (err) {
        showToast(err.message || 'Failed to create competition.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
