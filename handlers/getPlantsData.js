const ENV = require("../ENV");
const { listPivotCreateRaw, getPlantsGroups, rowsCollectFromRawObj, pivotCreateRowsFiltered, rowsArrayFromRaw, rowsArrayValues, rowsArrayTexts } = require("../modules/om.js")

OM.web("getPlantsData", async (request) => {
    const om = await OM.connectAsync(ENV.HOST, ENV.WSS, ENV.TOKEN, ENV.MODEL_ID);
    // return JSON.stringify(await om.common.modelInfo().nameAsync())

    // const rawData = await listPivotCreateRaw(om, ENV.LIST_PLANTS)
    // const questionsArrayRows = await rawData.getRowsAsArray();
    // return JSON.stringify(questionsArrayRows);

    const getPlantsList = async (om) => {
        return listPivotCreateRaw(om, ENV.LIST_PLANTS).then(
            (listOutPivot) => {
                return getPlantsGroups(
                    listOutPivot,
                    "longId",
                    "label",
                    "HEX",
                    ENV.PROPERTY_FILTER
                );
            }
        );
    };

    const getOptionsSelector = async (om) => {
        return listPivotCreateRaw(om, ENV.LIST_SELECTOR).then(
            (listOptions) => {
                return rowsCollectFromRawObj(
                    listOptions,
                    "longId",
                    "label",
                );
            }
        );
    };

    
    const getSelectedVersion = async (om) => {
        return pivotCreateRowsFiltered(
            om,
            ENV.MULTICUBE_SELECTOR,
            ENV.CUBE_SELECTOR,
        ).then((pivotSelectedVersion) => rowsArrayValues(pivotSelectedVersion));
    };

    return Promise.all([
        getPlantsList(om),
        getOptionsSelector(om),
        getSelectedVersion(om),
    ]).then((data) => {
        return JSON.stringify(data);

    })

    const rawData = await getPlantsList(om)
    return JSON.stringify(rawData)
    // return JSON.stringify([[{"id":211000000001,"content":"Линия А ПП","style":"background-color: #52B69A;","className":"plants"},{"id":211000000002,"content":"Линия Б ПП","style":"background-color: #52B69A;","className":"plants"},{"id":211000000005,"content":"Ex. P-129","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000006,"content":"Ex. P-130","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000007,"content":"Ex. P-131","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000008,"content":"Ex. P-132","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000009,"content":"Ex. P-133","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000010,"content":"Ex. P-134","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000011,"content":"Ex. P-2.2","style":"background-color: #34A0A4;","className":"plants"},{"id":211000000003,"content":"Фасовка ПП л.А","style":"background-color: #1A759F;","className":"plants"},{"id":211000000004,"content":"Фасовка ПП л.Б","style":"background-color: #1A759F;","className":"plants"}],{"388000000001":"Алгоритм","388000000002":"Ручная корректировка"},[[388000000001]]])
});
