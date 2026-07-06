

document.addEventListener('DOMContentLoaded', () => {

    let contacts = {};
    let activeTheme = localStorage.getItem('theme') || 'dark';
    let viewMode = localStorage.getItem('viewMode') || 'grid';
    let searchQuery = '';
    let deleteTarget = null;

    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const addContactBtn = document.getElementById('addContactBtn');
    const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const contactsContainer = document.getElementById('contactsContainer');
    const emptyState = document.getElementById('emptyState');

    const statTotal = document.getElementById('statTotal');
    const statPhone = document.getElementById('statPhone');
    const statEmail = document.getElementById('statEmail');

    const contactModal = document.getElementById('contactModal');
    const modalTitle = document.getElementById('modalTitle');
    const contactForm = document.getElementById('contactForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');

    const originalNameInput = document.getElementById('originalName');
    const contactNameInput = document.getElementById('contactName');
    const contactPhoneInput = document.getElementById('contactPhone');
    const contactEmailInput = document.getElementById('contactEmail');

    const deleteModal = document.getElementById('deleteModal');
    const deleteTargetName = document.getElementById('deleteTargetName');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const toastContainer = document.getElementById('toastContainer');

    applyTheme(activeTheme);
    applyViewMode(viewMode);
    fetchContacts();

    themeToggleBtn.addEventListener('click', toggleTheme);
    gridViewBtn.addEventListener('click', () => changeViewMode('grid'));
    listViewBtn.addEventListener('click', () => changeViewMode('list'));

    addContactBtn.addEventListener('click', () => openContactModal());
    emptyStateAddBtn.addEventListener('click', () => openContactModal());
    closeModalBtn.addEventListener('click', closeContactModal);
    cancelModalBtn.addEventListener('click', closeContactModal);

    contactForm.addEventListener('submit', handleFormSubmit);

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        toggleClearSearchButton();
        renderContacts();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        toggleClearSearchButton();
        renderContacts();
        searchInput.focus();
    });

    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', executeDeleteContact);

    [contactModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeContactModal();
                closeDeleteModal();
            }
        });
    });

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        activeTheme = theme;
    }

    function toggleTheme() {
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    }

    function applyViewMode(mode) {
        viewMode = mode;
        localStorage.setItem('viewMode', mode);

        if (mode === 'grid') {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            contactsContainer.className = 'contacts-grid';
        } else {
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            contactsContainer.className = 'contacts-list';
        }
    }

    function changeViewMode(mode) {
        applyViewMode(mode);
        renderContacts();
    }

    function toggleClearSearchButton() {
        if (searchInput.value.length > 0) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }

    async function fetchContacts() {
        try {
            const response = await fetch('/api/contacts');
            if (!response.ok) throw new Error('Failed to load contacts');
            contacts = await response.json();
            updateStats();
            renderContacts();
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('Unable to load contacts. Please verify if server is running.', 'error');
        }
    }

    async function saveContact(payload) {
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'Failed to save contact');
            }

            showToast(`Contact "${payload.name}" saved successfully!`, 'success');
            closeContactModal();
            fetchContacts();
        } catch (error) {
            console.error('Error saving contact:', error);
            showToast(error.message, 'error');
        }
    }

    async function executeDeleteContact() {
        if (!deleteTarget) return;

        try {
            const encodedName = encodeURIComponent(deleteTarget);
            const response = await fetch(`/api/contacts/${encodedName}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'Failed to delete contact');
            }

            showToast(`Deleted contact "${deleteTarget}"`, 'info');
            closeDeleteModal();
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast(error.message, 'error');
        }
    }

    function openContactModal(name = null) {
        clearFormErrors();
        contactForm.reset();

        if (name && contacts[name]) {
            modalTitle.textContent = 'Edit Contact';
            originalNameInput.value = name;
            contactNameInput.value = name;
            contactPhoneInput.value = contacts[name].phone || '';
            contactEmailInput.value = contacts[name].email || '';
        } else {
            modalTitle.textContent = 'Add New Contact';
            originalNameInput.value = '';
        }

        contactModal.classList.add('active');
        setTimeout(() => contactNameInput.focus(), 100);
    }

    function closeContactModal() {
        contactModal.classList.remove('active');
        contactForm.reset();
        clearFormErrors();
    }

    function openDeleteModal(name) {
        deleteTarget = name;
        deleteTargetName.textContent = name;
        deleteModal.classList.add('active');
    }

    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        deleteTarget = null;
    }

    function clearFormErrors() {
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('invalid'));
    }

    function validateForm() {
        let isValid = true;
        clearFormErrors();

        const name = contactNameInput.value.trim();
        const phone = contactPhoneInput.value.trim();
        const email = contactEmailInput.value.trim();

        if (!name) {
            document.getElementById('contactName').closest('.form-group').classList.add('invalid');
            isValid = false;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('contactEmail').closest('.form-group').classList.add('invalid');
                isValid = false;
            }
        }

        if (phone) {
            const phoneRegex = /^[\d\s()+\-.]+$/;
            if (!phoneRegex.test(phone) || phone.length < 5) {
                document.getElementById('contactPhone').closest('.form-group').classList.add('invalid');
                isValid = false;
            }
        }

        return isValid;
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            name: contactNameInput.value.trim(),
            phone: contactPhoneInput.value.trim(),
            email: contactEmailInput.value.trim(),
            original_name: originalNameInput.value ? originalNameInput.value.trim() : null
        };

        saveContact(payload);
    }

    function updateStats() {
        const list = Object.keys(contacts);
        const total = list.length;

        let withPhone = 0;
        let withEmail = 0;

        list.forEach(name => {
            if (contacts[name].phone && contacts[name].phone.trim() !== '') withPhone++;
            if (contacts[name].email && contacts[name].email.trim() !== '') withEmail++;
        });

        statTotal.textContent = total;
        statPhone.textContent = withPhone;
        statEmail.textContent = withEmail;
    }

    function getAvatarGradient(name) {

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const h1 = Math.abs(hash) % 360;
        const h2 = (h1 + 45) % 360; 

        const s = 65; 
        const l = 50; 

        const color1 = `hsl(${h1}, ${s}%, ${l}%)`;
        const color2 = `hsl(${h2}, ${s + 5}%, ${l - 5}%)`;

        return `linear-gradient(135deg, ${color1}, ${color2})`;
    }

    function getInitials(name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, Math.min(name.length, 2)).toUpperCase();
    }

    function renderContacts() {
        contactsContainer.innerHTML = '';

        const filteredNames = Object.keys(contacts).filter(name => {
            const item = contacts[name];
            const nameMatch = name.toLowerCase().includes(searchQuery);
            const phoneMatch = (item.phone || '').toLowerCase().includes(searchQuery);
            const emailMatch = (item.email || '').toLowerCase().includes(searchQuery);
            return nameMatch || phoneMatch || emailMatch;
        });

        if (filteredNames.length === 0) {
            emptyState.classList.remove('hidden');
            contactsContainer.style.display = 'none';
            return;
        } else {
            emptyState.classList.add('hidden');
            contactsContainer.style.display = viewMode === 'grid' ? 'grid' : 'flex';
        }

        filteredNames.forEach((name, index) => {
            const item = contacts[name];
            const card = document.createElement('div');
            card.className = 'contact-card';
            card.style.animationDelay = `${index * 0.05}s`;

            const initials = getInitials(name);
            const gradient = getAvatarGradient(name);

            const phoneValue = item.phone || '—';
            const emailValue = item.email || '—';

            const phoneLink = item.phone ? `href="tel:${item.phone.replace(/[^+\d]/g, '')}"` : 'style="pointer-events:none;"';
            const emailLink = item.email ? `href="mailto:${item.email}"` : 'style="pointer-events:none;"';

            card.innerHTML = `
                <div class="card-top">
                    <div class="avatar" style="background: ${gradient}">${initials}</div>
                    <div class="contact-meta">
                        <h3 class="contact-name" title="${name}">${name}</h3>
                    </div>
                </div>

                <div class="card-details">
                    <div class="detail-row">
                        <a ${phoneLink} class="detail-value" title="${phoneValue}">
                            <i data-lucide="phone"></i>
                            <span>${phoneValue}</span>
                        </a>
                        ${item.phone ? `
                        <button class="btn-copy" data-copy="${item.phone}" title="Copy phone number">
                            <i data-lucide="copy"></i>
                        </button>` : ''}
                    </div>

                    <div class="detail-row">
                        <a ${emailLink} class="detail-value" title="${emailValue}">
                            <i data-lucide="mail"></i>
                            <span>${emailValue}</span>
                        </a>
                        ${item.email ? `
                        <button class="btn-copy" data-copy="${item.email}" title="Copy email address">
                            <i data-lucide="copy"></i>
                        </button>` : ''}
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-edit-action" data-name="${name}">
                        <i data-lucide="edit-3"></i>
                        <span>Edit</span>
                    </button>
                    <button class="btn-delete-action" data-name="${name}">
                        <i data-lucide="trash-2"></i>
                        <span>Delete</span>
                    </button>
                </div>
            `;

            card.querySelector('.btn-edit-action').addEventListener('click', () => {
                openContactModal(name);
            });

            card.querySelector('.btn-delete-action').addEventListener('click', () => {
                openDeleteModal(name);
            });

            card.querySelectorAll('.btn-copy').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = btn.getAttribute('data-copy');
                    navigator.clipboard.writeText(text).then(() => {
                        showToast('Copied to clipboard!', 'info');
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                });
            });

            contactsContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'x-circle';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4000);
    }
});
