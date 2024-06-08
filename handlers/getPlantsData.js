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

    // const rawData = await getPlantsList(om)
    // return JSON.stringify(rawData);
});