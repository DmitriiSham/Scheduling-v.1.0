document.addEventListener('DOMContentLoaded', async () => {
    await filtersNames();
    console.log("Loading done")
});


const filtersNames = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('version');

    if (!version) {
        const versionFilter = document.getElementById('versionFilter');

        if (versionFilter.value) {
            const { protocol, host, pathname } = window.location
            const refresh = `${protocol}//${host}${pathname}?version=${versionFilter.value}`;
            window.history.pushState({ path: refresh }, '', refresh);
        }
    }

}

document.getElementById('filtersForm').onsubmit = async function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const versionFilter = document.getElementById('versionFilter');
    const loader = document.getElementById('formLoader');
    if (loader) {
        loader.style.display = "block"; // Показать лоадер
    }
    await sendSelectorOption(versionFilter.value);
    // this.submit()
    if (loader) {
        loader.style.display = "none"; // Скрыть лоадер после завершения запроса
    }
};

const selectorOptions = (optionsList, optionSelected) => {
    const selector = document.getElementById('versionFilter');
    for (let [value, text] of Object.entries(optionsList)) {
        const isSelected = Number(optionSelected[0][0]) === Number(value);
        const optionNew = new Option(text, value, isSelected, isSelected)
        selector.appendChild(optionNew)

        // console.log([Number(optionSelected[0][0]), Number(value)])
    }
}


Promise.all([
    getPlantsData(),
    getSchedulerData(),
]).then((data) => {
    const [plants, plantsItems] = data;
    return initializeTimeline(plants, plantsItems);
})

async function getPlantsData() {
    const plants = await fetch('./getPlantsData')
        .then((result) => {
            if (result.ok) {
                return result.json();
            }
            return Promise.reject(new Error(result.statusText));
        })
        .then((json) => {
            if (json && json.length > 0) {
                return json;
            } else {
                return Promise.reject(new Error("Empty JSON object!"));
            }
        })
        .catch((error) => {
            console.error('Ошибка при получении schedule:', error.message);
            return {};
        })

    return plants;
}

async function getSchedulerData() {
    const plants = await fetch('./getSchedulerData')
        .then((result) => {
            if (result.ok) {
                return result.json();
            }
            return Promise.reject(new Error(result.statusText));
        })
        .then((json) => {
            if (json && json.length > 0) {
                return json;
            } else {
                return Promise.reject(new Error("Empty JSON object!"));
            }
        })
        .catch((error) => {
            console.error('Ошибка при получении schedule:', error.message);
            return {};
        })

    return plants;
}

async function initializeTimeline(plants, plantsItems) {

    // console.log(plants)
    // console.log(plantsItems)

    // create groups
    var groups = new vis.DataSet(plants[0]); // для группировки items по линиям, формат [{}]

    // create items
    var items = new vis.DataSet(plantsItems);

    // options
    var options = {
        stack: true,
        showTooltips: false,
        horizontalScroll: true,
        // verticalScroll: true,
        zoomKey: "ctrlKey",
        // maxHeight: window.innerHeight,
        groupHeightMode: "fixed",
        start: Date.parse("01/01/2023 00:00"),
        end: Date.parse("01/04/2023 00:00"),
        editable: {
            add: false,         // add new items by double tapping
            updateTime: true,  // drag items horizontally
            updateGroup: false, // drag items from one group to another
            remove: true,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
        },
        margin: {
            item:
            {
                vertical: 5,
                horizontal: 0,

            }, // minimal margin between items
            axis: 2, // minimal margin between items and the axis
        },
        orientation: "top",
        zoomMin: 10 * 60 * 1000,
        // zoomMax: 48 * 60 * 60 * 1000,
        locale: 'ru',
        // Обработка события переноса (процесс) с ограничением в рамках дня (original)
        onMoving: function (item, callback) {
            if (!item.originalStart) {
                item.originalStart = new Date(item.start);
                item.originalStart.setHours(0, 0, 0, 0);
            }
            // console.log(item)
            if (!item.originalEnd) {
                item.originalEnd = new Date(item.end);
                item.originalEnd.setHours(23, 59, 59, 999);
            }

            const min = item.originalStart;
            const max = item.originalEnd;

            if (item.start <= min) item.start = min;
            if (item.start >= max) item.start = max;
            if (item.end >= max) item.end = max;

            callback(item); // send back the (possibly) changed item
        },
        // Обработка события переноса (именно завершенного)
        onMove: async function (item, callback) {
            // Преобразование строки в объект Date
            const startDate = new Date(item.start);
            const endDate = new Date(item.end);

            // Форматирование даты в строку в требуемом формате
            const formateDate = (date) => { return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`; }
            const formateTime = (date) => { return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`; }
            const formattedStartDate = formateDate(startDate);
            const formattedStartTime = formateTime(startDate);
            const formattedEndDate = formateDate(endDate);
            const formattedEndTime = formateTime(endDate);

            const [plantId, numId] = item.id.split('.');
            // console.log([formattedStartDate, formattedEndDate])

            const title = `Вы уверены, что хотите переместить элемент на начало: ${formattedStartDate} ${formattedStartTime} и конец: ${formattedEndDate} ${formattedEndTime} ?`;
            const resultSwal = await swal({
                title: "Перемещение",
                text: title,
                icon: "warning",
                buttons: true,
            });
            try {
                if (resultSwal) {
                    await callback(item);
                    await sendData(plantId, numId, formattedStartDate, formattedStartTime, formattedEndDate, formattedEndTime);
                } else {
                    await callback(null);
                };
            } catch (error) {
                swal("Ошибка!", "Произошла ошибка при перемещении элемента.", "error");
                console.error(error);
            };
        },
        // Обработка события удаления
        onRemove: async function (item, callback) {
            const [plantId, numId] = item.id.split('.');
            // console.log([formattedStartDate, formattedEndDate])
            const answerToModel = "Deleted"

            const title = `Вы уверены, что хотите удалить элемент ?`;
            const resultSwal = await swal({
                title: "Удаление",
                text: title,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            });
            try {
                if (resultSwal) {
                    await callback(item);
                    await sendData(plantId, numId, answerToModel, answerToModel, answerToModel, answerToModel);
                } else {
                    await callback(null);
                };
            } catch (error) {
                swal("Ошибка!", "Произошла ошибка при удалении элемента.", "error");
                console.error(error);
            };
        },

    };
    // Создаем контейнер и Timeline
    var container = document.getElementById("visualization");
    timeline = new vis.Timeline(container, items, groups, options);

    // Событие по клику
    let selectedItemsId = [];
    timeline.on('click', function (properties) {
        if (properties.item) {
            // Получаем текущие выделенные элементы
            const popover = document.getElementById('popover');
            popover.innerHTML = plantsItems.find(item => item.id === properties.item).content;
            let x = properties.x;
            let y = properties.y;
            // Убедимся, что popover полностью виден на экране
            const popoverWidth = popover.offsetWidth;
            const popoverHeight = popover.offsetHeight;
            // Добавим смещения для позиционирования ближе к курсору
            let offsetX = -200; // Смещение по горизонтали
            let offsetY = -300;  // Смещение по вертикали
            if ((x + popoverWidth + offsetX) > window.innerWidth) {
                x -= popoverWidth + offsetX;
            } else {
                x += offsetX;
            }
            if ((y + popoverHeight + offsetY) > window.innerHeight) {
                y -= popoverHeight + offsetY;
            } else {
                y += offsetY;
            }
            popover.style.left = x + 'px';
            popover.style.top = y + 'px';
            // console.log(popover.style.left, popover.style.top, popover.offsetWidth)
            let selectedItems = timeline.getSelection();
            // console.log(popoverItem)
            // Проверяем, является ли выделенный элемент таким же, как предыдущий
            if (selectedItems.length === 1 && selectedItems[0] === selectedItemsId[0]) {
                // Если элемент уже выделен, снимаем выделение
                document.getElementById('popover').hidePopover()
                console.log("уже был выделен")
                timeline.setSelection([]);
                selectedItemsId = [];
            } else {
                // Иначе выделяем элемент
                document.getElementById('popover').showPopover()
                selectedItemsId = [properties.item];
                timeline.setSelection(properties.item);
            }
        } else {
            // Если клик не по элементу, убираем выделение со всех элементов
            document.getElementById('popover').hidePopover()
            timeline.setSelection([]);
            selectedItemsId = [];
        }
    });
    //создаем селекторы
    selectorOptions(plants[1], plants[2])

}

// Передача данных в модель
async function sendData(plantId, numId, start, startTime, end, endTime) {
    // event.preventDefault();
    const url = ('./sendData?' + new URLSearchParams({ plantId: plantId, numId: numId, start: start, startTime: startTime, end: end, endTime: endTime }).toString());
    await fetch(url)
        .then((result) => {
            if (result.ok) {
                return result.json()
            }
            Promise.reject(new Error(result.statusText))
        })
        .then(json => console.log(json))
        .catch((error) => {
            console.error('Ошибка при отправлении item:', error.message)
        })
}

async function sendSelectorOption(version) {
    // event.preventDefault();
    const form = document.getElementById('filtersForm');
    const url = ('./sendData?' + new URLSearchParams({ version: version }).toString());
    await fetch(url)
        .then((result) => {
            if (result.ok) {
                form.submit()
                return result.json()
            }
            Promise.reject(new Error(result.statusText))

        })
        .then(json => console.log(json))
        .catch((error) => {
            console.error('Ошибка при отправлении item:', error.message)
        })
}

