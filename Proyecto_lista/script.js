// ---------- DATOS BASE (Mock) ----------
let items = [
   
];

// Estado global
let currentEditId = null;            // null = modo creación
let currentSort = { field: 'name', direction: 'asc' };   // campo, 'asc' o 'desc'
let filters = { name: '', category: '', year: '' };

// Referencias DOM
const tbody = document.getElementById('tableBody');
const nameInput = document.getElementById('itemName');
const categoryInput = document.getElementById('itemCategory');
const yearInput = document.getElementById('itemYear');
const btnAddUpdate = document.getElementById('btnAddOrUpdate');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const formModeLabel = document.getElementById('formModeLabel');
const itemsCountDisplay = document.getElementById('itemsCountDisplay');

// Filtros inputs
const filterNameEl = document.getElementById('filterName');
const filterCategoryEl = document.getElementById('filterCategory');
const filterYearEl = document.getElementById('filterYear');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// Helper: guardar siguiente ID (máximo + 1)
function getNextId() {
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.id)) + 1;
}

// ----- FILTRADO (coincidencia parcial, case-insensitive) -----
function applyFilters() {
    // actualiza objeto filters desde inputs
    filters.name = filterNameEl.value.trim().toLowerCase();
    filters.category = filterCategoryEl.value.trim().toLowerCase();
    filters.year = filterYearEl.value.trim().toLowerCase();

    const filtered = items.filter(item => {
        let matchName = true, matchCat = true, matchYear = true;
        if (filters.name) matchName = item.name.toLowerCase().includes(filters.name);
        if (filters.category) matchCat = item.category.toLowerCase().includes(filters.category);
        if (filters.year) matchYear = item.year.toString().includes(filters.year);
        return matchName && matchCat && matchYear;
    });
    return filtered;
}

// ----- ORDENAMIENTO (sobre array filtrado) -----
function sortItems(filteredArray) {
    const sorted = [...filteredArray];
    const { field, direction } = currentSort;
    sorted.sort((a, b) => {
        let valA, valB;
        if (field === 'year') {
            valA = a.year;
            valB = b.year;
        } else {
            valA = a[field].toLowerCase();
            valB = b[field].toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
}

// Escapar HTML para evitar XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Renderiza la tabla con filtros + orden + actualiza contador
function renderTable() {
    const filteredData = applyFilters();
    const sortedData = sortItems(filteredData);
    
    const totalItems = items.length;
    const visibleCount = filteredData.length;
    itemsCountDisplay.innerText = `${visibleCount} / ${totalItems} elementos`;

    if (sortedData.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="4">📭 No hay coincidencias. Prueba otros filtros o añade elementos.</td></tr>`;
        return;
    }

    tbody.innerHTML = sortedData.map(item => `
        <tr data-id="${item.id}">
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${escapeHtml(item.category)}</td>
            <td>${item.year}</td>
            <td class="actions-cell">
                <button class="edit-btn" data-id="${item.id}">✏️ Editar</button>
                <button class="delete-btn" data-id="${item.id}">🗑 Eliminar</button>
            </td>
        </tr>
    `).join('');

    // Adjuntar eventos dinámicos a botones de editar/eliminar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            startEditMode(id);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            deleteItemById(id);
        });
    });
}

// ----- CRUD Operaciones -----
function addOrUpdateItem() {
    let name = nameInput.value.trim();
    let category = categoryInput.value.trim();
    let yearRaw = yearInput.value.trim();

    // Validaciones
    if (name === "") {
        alert("El nombre del elemento no puede estar vacío.");
        return;
    }
    if (category === "") {
        alert("La categoría no puede estar vacía.");
        return;
    }
    if (yearRaw === "") {
        alert("Por favor ingresa un año de lanzamiento.");
        return;
    }
    const yearNum = parseInt(yearRaw, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2099) {
        alert("Año inválido. Debe ser un número entre 1900 y 2099.");
        return;
    }

    // Modo edición vs creación
    if (currentEditId !== null) {
        const index = items.findIndex(i => i.id === currentEditId);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                name: name,
                category: category,
                year: yearNum
            };
        } else {
            alert("Elemento a editar no encontrado.");
            resetFormToAddMode();
            renderTable();
            return;
        }
        resetFormToAddMode();
        renderTable();
    } else {
        const newId = getNextId();
        const newItem = {
            id: newId,
            name: name,
            category: category,
            year: yearNum
        };
        items.push(newItem);
        resetFormToAddMode();
        renderTable();
    }
    nameInput.focus();
}

// Eliminar por ID
function deleteItemById(id) {
    if (confirm("¿Estás seguro de eliminar este elemento permanentemente?")) {
        items = items.filter(item => item.id !== id);
        if (currentEditId === id) {
            resetFormToAddMode();
        }
        renderTable();
    }
}

// Activar modo edición
function startEditMode(id) {
    const itemToEdit = items.find(item => item.id === id);
    if (!itemToEdit) return;
    currentEditId = id;
    nameInput.value = itemToEdit.name;
    categoryInput.value = itemToEdit.category;
    yearInput.value = itemToEdit.year;
    formModeLabel.innerText = `✏️ Editando: "${itemToEdit.name}"`;
    btnAddUpdate.classList.add("primary");
    btnAddUpdate.innerText = "✅ Actualizar elemento";
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Resetear formulario a modo "Agregar nuevo"
function resetFormToAddMode() {
    currentEditId = null;
    nameInput.value = "";
    categoryInput.value = "";
    yearInput.value = "";
    formModeLabel.innerText = "Agregar nuevo elemento";
    btnAddUpdate.innerText = "➕ Añadir / Actualizar";
}

// Limpiar filtros
function clearAllFilters() {
    filterNameEl.value = "";
    filterCategoryEl.value = "";
    filterYearEl.value = "";
    filters = { name: '', category: '', year: '' };
    renderTable();
}

// Cancelar edición
function cancelEdit() {
    if (currentEditId !== null) {
        if (confirm("¿Cancelar edición? Los cambios no guardados se perderán.")) {
            resetFormToAddMode();
        }
    } else {
        nameInput.value = "";
        categoryInput.value = "";
        yearInput.value = "";
    }
}

// Actualizar indicadores visuales de ordenamiento
function updateSortIndicators() {
    const headers = document.querySelectorAll('#dataTable th[data-field]');
    headers.forEach(th => {
        const field = th.getAttribute('data-field');
        const span = th.querySelector('.sort-indicator');
        if (span) {
            if (currentSort.field === field) {
                span.innerHTML = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            } else {
                span.innerHTML = '';
            }
        }
    });
}

// Configurar listeners de ordenamiento
function setupSortingListeners() {
    const headers = document.querySelectorAll('#dataTable th[data-field]');
    headers.forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-field');
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            updateSortIndicators();
            renderTable();
        });
    });
}

// Configurar eventos de filtro
function bindFilterEvents() {
    filterNameEl.addEventListener('input', () => renderTable());
    filterCategoryEl.addEventListener('input', () => renderTable());
    filterYearEl.addEventListener('input', () => renderTable());
    clearFiltersBtn.addEventListener('click', clearAllFilters);
}

// Inicialización
function init() {
    renderTable();
    bindFilterEvents();
    setupSortingListeners();
    updateSortIndicators();
    btnAddUpdate.addEventListener('click', addOrUpdateItem);
    btnCancelEdit.addEventListener('click', cancelEdit);
    
    // Enter en campos del formulario
    const inputsForm = [nameInput, categoryInput, yearInput];
    inputsForm.forEach(inp => {
        inp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addOrUpdateItem();
            }
        });
    });
}

// Iniciar aplicación
init();
