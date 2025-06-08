let currentChecks = {};
let selectedUser = null;
let lists = {};

document.addEventListener('DOMContentLoaded', async () => {
    const headerUpdate = document.getElementById('header-updater');
    headerUpdate.addEventListener('click', reloadPage);

    await loadChecklistData();
    loadChecks();

    document.getElementById('tripType').addEventListener('change', loadChecklist);

    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
        selectUser(savedUser); // автоматический выбор
    } else {
        document.getElementById('tripSelector').style.display = 'none'; // спрятать выбор рейса до выбора пользователя
    }
});

function reloadPage() {
    location.reload();
}

async function loadChecklistData() {
    try {
        const response = await fetch('list.json');
        lists = await response.json();
    } catch (error) {
        console.error("Ошибка загрузки list.json:", error);
    }
}

function selectUser(user) {
    selectedUser = user;
    localStorage.setItem('selectedUser', user);
    document.getElementById('userSelect').style.display = 'none';
    document.getElementById('tripSelector').style.display = 'block';

    const tripTypeSelect = document.getElementById('tripType');
    tripTypeSelect.value = localStorage.getItem('tripType') || 'flight';
    loadChecklist();
}

async function loadChecklist() {
    if (!selectedUser || !lists[selectedUser]) return;

    const tripType = document.getElementById('tripType').value;
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';

    localStorage.setItem('tripType', tripType);

    const sections = lists[selectedUser][tripType];
    if (!sections) {
        checklist.innerHTML = '<p>Нет данных для выбранного типа поездки.</p>';
        return;
    }

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
            const itemId = `${selectedUser}-${tripType}-${sectionName}-${index}`;
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
            const isCollapsed = section.classList.toggle('collapsed');
            if (isCollapsed) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }

        });

        content.appendChild(itemsList);
        content.style.maxHeight = content.scrollHeight + "px";
        section.appendChild(title);
        section.appendChild(content);
        checklist.appendChild(section);
    }

    const allCheckedBanner = document.getElementById('all-checked-banner');
    allCheckedBanner.style.display = allSectionsChecked ? 'block' : 'none';
}

function toggleCheck(itemId, element) {
    currentChecks[itemId] = !currentChecks[itemId];
    element.classList.toggle('checked');
    element.querySelector('.checkbox i').className = `fas fa-${currentChecks[itemId] ? 'check-square' : 'square'}`;
    saveChecks();

    const section = element.closest('.section');
    const items = section.querySelectorAll('.checklist-item');
    const allChecked = Array.from(items).every(item => item.classList.contains('checked'));

    section.classList.toggle('fully-checked', allChecked);
    if (allChecked) {
        section.classList.add('collapsed');
    } else {
        section.classList.remove('collapsed');
    }

    const sections = document.querySelectorAll('.section');
    const allSectionsChecked = Array.from(sections).every(section =>
        section.classList.contains('fully-checked')
    );

    const allCheckedBanner = document.getElementById('all-checked-banner');
    allCheckedBanner.style.display = allSectionsChecked ? 'block' : 'none';
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

function changeUser() {
    localStorage.removeItem('selectedUser');
    selectedUser = null;
    document.getElementById('userSelect').style.display = 'block';
    document.getElementById('tripSelector').style.display = 'none';
    document.getElementById('checklist').innerHTML = '';
    document.getElementById('all-checked-banner').style.display = 'none';
}
