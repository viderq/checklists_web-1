let currentChecks = {};

document.addEventListener('DOMContentLoaded', () => {
    const headerUpdate = document.getElementById('header-updater');
    headerUpdate.addEventListener('click', reloadPage);

    loadChecks();
    const tripTypeSelect = document.getElementById('tripType');

    tripTypeSelect.value = localStorage.getItem('tripType') || 'flight';

    tripTypeSelect.addEventListener('change', loadChecklist);
    loadChecklist();
});

function reloadPage() {
    location.reload();
}

async function loadChecklist() {
    const response = await fetch('list.json');
    const lists = await response.json();
    const tripType = document.getElementById('tripType').value;
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';

    // Сохраняем в localStorage.
    localStorage.setItem('tripType', tripType);

    const sections = lists[tripType];
    let allSectionsChecked = true;

    for (const [sectionName, items] of Object.entries(sections)) {
        if (items.length === 0) continue;

        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.innerHTML = `
            <i class="fas ${getSectionIcon(sectionName)}"></i>
            ${getSectionTitle(sectionName)}
            <span class="status-icon">
                <span class="checkmark"><i class="fas fa-check"></i></span>
                <span class="collapse-icon"><i class="fas fa-chevron-down"></i></span>
            </span>
        `;

        const content = document.createElement('div');
        content.className = 'section-content';

        const itemsList = document.createElement('div');
        let allChecked = true;

        items.forEach((item, index) => {
            const itemId = `${tripType}-${sectionName}-${index}`;
            const itemElement = document.createElement('div');
            itemElement.className = `checklist-item ${currentChecks[itemId] ? 'checked' : ''}`;
            itemElement.innerHTML = `
                <span class="checkbox">
                    <i class="fas fa-${currentChecks[itemId] ? 'check-square' : 'square'}"></i>
                </span>
                ${item}
            `;
            itemElement.addEventListener('click', () => toggleCheck(itemId, itemElement));
            itemsList.appendChild(itemElement);

            if (!currentChecks[itemId]) allChecked = false;
        });

        if (allChecked) {
            section.classList.add('collapsed', 'fully-checked');
        } else {
            allSectionsChecked = false;
        }

        title.addEventListener('click', () => {
            section.classList.toggle('collapsed');
        });

        content.appendChild(itemsList);
        section.appendChild(title);
        section.appendChild(content);
        checklist.appendChild(section);
    }

    // Показываем или скрываем плашку "Всё проверено"
    const allCheckedBanner = document.getElementById('all-checked-banner');
    if (allSectionsChecked) {
        allCheckedBanner.style.display = 'block';
    } else {
        allCheckedBanner.style.display = 'none';
    }
}

function toggleCheck(itemId, element) {
    currentChecks[itemId] = !currentChecks[itemId];
    element.classList.toggle('checked');
    element.querySelector('.checkbox i').className = `fas fa-${currentChecks[itemId] ? 'check-square' : 'square'}`;
    saveChecks();

    // Проверяем статус всей секции
    const section = element.closest('.section');
    const items = section.querySelectorAll('.checklist-item');
    const allChecked = Array.from(items).every(item => item.classList.contains('checked'));

    section.classList.toggle('fully-checked', allChecked);
    if (allChecked) {
        section.classList.add('collapsed');
    } else {
        section.classList.remove('collapsed');
    }

    // Проверяем статус всех разделов
    const sections = document.querySelectorAll('.section');
    const allSectionsChecked = Array.from(sections).every(section =>
        section.classList.contains('fully-checked')
    );

    const allCheckedBanner = document.getElementById('all-checked-banner');
    if (allSectionsChecked) {
        allCheckedBanner.style.display = 'block';
    } else {
        allCheckedBanner.style.display = 'none';
    }
}

function getSectionIcon(sectionName) {
    const icons = {
        suitcase: 'fa-suitcase',
        portfolio: 'fa-briefcase',
        precheck: 'fa-door-open'
    };
    return icons[sectionName] || 'fa-list';
}

function getSectionTitle(sectionName) {
    const titles = {
        suitcase: 'Вещи чемодана',
        portfolio: 'Рабочий портфель',
        precheck: 'Проверка перед выходом'
    };
    return titles[sectionName] || sectionName;
}

function resetChecks() {
    currentChecks = {};
    saveChecks();
    loadChecklist();
}

function saveChecks() {
    localStorage.setItem('travelChecklist', JSON.stringify(currentChecks));
}

function loadChecks() {
    currentChecks = JSON.parse(localStorage.getItem('travelChecklist') || '{}');
}