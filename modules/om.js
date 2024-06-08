const listPivotCreateRaw = async (om, list, view) => {
    const listTab = om.lists.listsTab().open(list).pivot(view);
    const listGrid = await listTab.createAsync();
    const listGenerator = listGrid.range().generator();
    for await (const chunk of listGenerator) {
        const raw = await chunk.rawDataAsync();
        return raw;
    }
}

const getPlantsGroups = async (rawData, propertyId, propertyContent, propertyStyle, propertyFilter) => {
    const questionsArray = rawData.rowsHeaders();
    const cellsArray = rawData.getRowsAsArray();
    let rowsArr = [];
    questionsArray.forEach((item, index) => {
        if (cellsArray[index][propertyFilter] === 'true') {
            const rowObj = {
                id: item[0][propertyId],
                content: item[0][propertyContent],
                // style: `font-weight: bold; color: white; background-color: ${cellsArray[index][propertyStyle]};`,
                style: `background-color: ${cellsArray[index][propertyStyle]};`,
                className: 'plants',
            };
            rowsArr.push(rowObj);
        }
    })
    return rowsArr;
}

const pivotCreateRaw = async (om, mc, view) => {
    const pivot = om.multicubes.multicubesTab().open(mc).pivot(view);
    const grid = await pivot.createAsync();
    const generator = grid.range().generator();
    for (const chunk of generator) {
        const raw = await chunk.rawDataAsync();
        return raw;
    }
}

const pivotCreateRowsFiltered = async (om, mc, rowsfilter, view) => {
    const pivot = om.multicubes
        .multicubesTab()
        .open(mc)
        .pivot(view)
        .rowsFilter(Number(rowsfilter));
    const grid = await pivot.createAsync();
    const generator = grid.range().generator();
    for (const chunk of generator) {
        const raw = await chunk.rawDataAsync();
        return raw;
    }
}

const rowsHeaders = async (rawData) => {
    const questionsArray = rawData.rowsHeaders();
    return questionsArray;
}

const rowsArrayTexts = async (rawData) => {
    const questionsArray = rawData.getRawTexts();
    return questionsArray;
}

const rowsArrayValues = async (rawData) => {
    const questionsArray = rawData.getRawNativeValues();
    return questionsArray;
}

const rowsArrayFromRaw = async (rawData) => {
    const questionsArray = rawData.getRowsAsArray();
    return questionsArray;
}

const rowsCollectFromRawObj = async (rawData, property1, property2) => {
    const questionsArray = rawData.rowsHeaders();
    let rowsObj = {};
    questionsArray.forEach((item) => {
        rowsObj[item[0][property1]] = item[0][property2];
    })
    return rowsObj;
}

const getPlantsItems = async (headersArray, cellsArray, propertyContent, propertyStart, propertyEnd, propertyStatus, propertyStyle) => {
    // const headersArray = rawData.rowsHeaders();
    // const cellsArray = rawData.rowsArrayFromRaw();
    let rowsArr = [];
    headersArray.forEach((item, index) => {
        if (cellsArray[index][propertyContent] && cellsArray[index][propertyStatus]) {
            const rowObj = {
                id: `${item[0]["longId"]}.${item[1]["longId"]}`,
                group: item[0]["longId"],
                start: new Date(cellsArray[index][propertyStart]).toLocaleString(),
                end: new Date(cellsArray[index][propertyEnd]).toLocaleString(),
                className: cellsArray[index][propertyStatus], //className
                content: `<div>${cellsArray[index][propertyContent]}</div>`,
                title: `<div>${cellsArray[index][propertyContent]}</div>`,
                style: `background-color: ${cellsArray[index][propertyStyle]};`,
            };
            rowsArr.push(rowObj);
        }
    })
    return rowsArr;
    /*
  id: longId('L04.02 Установки').longId(s.NUM 10),
  group: longId('L04.02 Установки'),
  start: start,
  end: end,
  className: status, //className
  content: `<div>${text}</div>`,
  style: status.HEX,*/

}


const filteredMcGenerator = async (om, mc, filter1, filter2, view) => {
    const pivot = om.multicubes
        .multicubesTab()
        .open(mc)
        .pivot(view)
        .rowsFilter(Number(filter1))
        .addDependentContext(Number(filter2));
    const grid = await pivot.createAsync();
    const generator = grid.range().generator();
    return generator;
}

const filteredMcGeneratorWithoutContext = async (om, mc, filter1, view) => {
    const pivot = om.multicubes
        .multicubesTab()
        .open(mc)
        .pivot(view)
        .rowsFilter(Number(filter1));
    const grid = await pivot.createAsync();
    const generator = grid.range().generator();
    return generator;
}

const sendNewDates = async (
    om,
    mcMain,
    mcMainNewChainView,
    plantId,
    numId,
    startDate,
    startTime,
    endDate,
    endTime,
) => {
    const generatorMainMc = await filteredMcGenerator(om, mcMain, plantId, numId, mcMainNewChainView);
    // let ar = ["helo"]
    if (generatorMainMc.length) {
        const cb = om.common.createCellBuffer().canLoadCellsValues(false);
        const label = await generatorMainMc[0].rowsAsync();
        const labelGroup = await label.allAsync();
        labelGroup.forEach((label) => {
            const [cellStartDate, cellStartTime, cellEndDate, cellEndTime] = label.cells().all();
            if (cellStartDate.isEditable() && cellEndDate.isEditable()) {
                cb.set(cellStartDate, startDate);
                cb.set(cellStartTime, startTime);
                cb.set(cellEndDate, endDate);
                cb.set(cellEndTime, endTime);
            }
        });
        await cb.applyAsync();
        return [startDate, startTime, endDate, endTime]
    }
}

// const sendSelectorValue = async (om, mc, cubeFilter, inputValue, mcView) => {
//     const generatorMainMc = await filteredMcGeneratorWithoutContext(om, mc, cubeFilter, mcView);
//     // let ar = ["helo"]
//     if (generatorMainMc.length) {
//         const cb = om.common.createCellBuffer().canLoadCellsValues(false);
//         const label = await generatorMainMc[0].rowsAsync();
//         const labelGroup = await label.allAsync();
//         labelGroup.forEach((label) => {
//             const cell = label.cells().first();
//             if (cell.isEditable()) {
//                 cb.set(cell, inputValue);
//             }
//         });
//         await cb.applyAsync();
//         return inputValue;
//     }
// }

const sendSelectorValue = async (om, mc, cubeFilter, inputValue, mcView) => {
    const generatorMainMc = await filteredMcGeneratorWithoutContext(om, mc, cubeFilter, mcView);
    // let ar = ["helo"]
    if (generatorMainMc.length) {
        const cb = om.common.createCellBuffer().canLoadCellsValues(false);
        const cell = (await generatorMainMc[0].cellsAsync()).first();
        if (cell.isEditable()) {
            cb.set(cell, inputValue);
        }
        await cb.applyAsync();
        return cell.getValue();
    }
}

module.exports = {
    listPivotCreateRaw,
    getPlantsGroups,
    pivotCreateRaw,
    rowsHeaders,
    rowsArrayValues,
    rowsArrayFromRaw,
    getPlantsItems,
    sendNewDates,
    filteredMcGenerator,
    rowsCollectFromRawObj,
    sendSelectorValue,
    rowsArrayTexts,
    pivotCreateRowsFiltered,
}