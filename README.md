Версия `1.0`

### 1. Общее описание:

![alt text](pics/image.png)

В верхней левой части интерфейса отображается фильтр версий для просмотра и кнопка применения.

Ниже расположен непосредственно блок планировщика (scheduler), который показывает задачи/события, распределенные по времени и по производственным линиям.

### 2. Интерфейс и возможности пользователя:

1.  Переходя по ссылке пользователь видит данные первого элемента фильтра `Версия для просмотра` по-умолчанию. (В дальнейшем при выборе опции фильтра - сохраняется выбор) ![alt text](pics/image-1.png)

    и начальную временную точку самой первой производственной задачи
    ![alt text](pics/image-2.png)

2.  Первая колонка графика - это производственные линии (элементы `groups`). Высота `fixed` и зависит от `content` событий на данной линии, вертикальная прокрутка таблицы настроена при наведении курсора на поле данной колонки  
    ![alt text](pics/image-3.png)
3.  В шапке таблицы находится временная шкала с двумя строчками по логике `parent` -> `child`:
    ![alt text](pics/image-4.png)
    минимальная детализация настроена до минуты
    ![alt text](pics/image-5.png)
    ограничение максимальной детализации отключено опционально для удобства для данной модели
    ![alt text](pics/image-6.png)
    возможность zoom настроена по комбинации `wheel`+`ctrlKey`

4.  В строчках таблицы расположены задачи/события (элементы `items`) сгруппированные по линиям, границы каждой задачи это `start` и `end` временных точек. Реализованные возможности:

-   перемещение элементов горизонтально в пределах дня в зависимоти от начала и окончания задачи/события с подтверждением и возвратом в первоначальное положение при отклонении. (Перемещение между линиями отключено опционально для данной модели)
    ![alt text](pics/image-9.png)![alt text](pics/image-8.png)
-   удаление элементов с подтверждением и возвратом в первоначальное положение при отклонении.
    ![alt text](pics/image-10.png)![alt text](pics/image-11.png)
-   выделение и снятие выделения по `click` на элемент
-   горизонтальная прокрутка таблицы настроена на `wheel` при наведении курсора на поле задач/событий
-   при выделении элементов (особенно удобно если небольшой временной интервал) появляется `popover` (всплывающие элементы) с полным содержанием
    ![alt text](pics/image-13.png)
-   все корректировки записываются в модель и возможны для просмотра при выборе фильтра `Ручная корректировка`

    ![alt text](pics/image-12.png)

### 3. Кратко об архитектуре приложения:

![alt text](pics/image-15.png)

-   источники данных представлены в `ENV.js`
-   приложение реализовано с применением 3 `webhandlers`
-   реализовано параллельное чтение данных по `groups` и `items` из модели
-   цветовые параметры `groups` и `items` передаются из модели и доступны для настройки пользователям
-   запись данных в модель с форматированием даты и времени под форматы ОМ для облегчения мэппинга и дальнейших пересчетов в модели
-   запись данных в модель при корректировках реализовано по составному `id` элемента `group[longId].item[longId]`
-   график строится `new vis.Timeline(container, items, groups, options)` где:

    `container` - содержит ссылку на DOM-элемент `<div id="visualization"></div>`

    `items` - это данные, которые отображаются на временной шкале (события/задачи)

    `groups`- группы элементы на временной шкале (установки)

    `options` - это параметры конфигурации временной шкалы, которые позволяют настраивать внешний вид и поведение элементов.

### 4. Ресурсы, используемые при разработке (библиотеки, фреймворки):

-   [Vis-timeline](https://visjs.github.io/vis-timeline/) для создания временной шкалы (timeline) и элементов
-   CSS [Spectre.css](https://github.com/picturepan2/spectre)
-   Уведомления [SweetAlert](https://sweetalert.js.org/)

- [x] works
- [x] works too