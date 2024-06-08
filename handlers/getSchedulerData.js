const ENV = require("../ENV");
const {
    pivotCreateRaw,
    rowsHeaders,
    rowsArrayFromRaw,
    getPlantsItems,
} = require("../modules/om.js");

OM.web("getSchedulerData", async (request) => {
    const om = await OM.connectAsync(
        ENV.HOST,
        ENV.WSS,
        ENV.TOKEN,
        ENV.MODEL_ID
    );
    // return JSON.stringify(await om.common.modelInfo().nameAsync())

    const getSchedulerHeaders = async (om) => {
        return pivotCreateRaw(
            om,
            ENV.MULTICUBE_MAIN_COMMON,
            ENV.MULTICUBE_MAIN_COMMON_VIEW
        ).then((pivotMainMc) => rowsHeaders(pivotMainMc));
    };
    const getSchedulerCells = async (om) => {
        return pivotCreateRaw(
            om,
            ENV.MULTICUBE_MAIN_COMMON,
            ENV.MULTICUBE_MAIN_COMMON_VIEW
        ).then((pivotMainMc) => rowsArrayFromRaw(pivotMainMc));
    };

    return Promise.all([getSchedulerHeaders(om), getSchedulerCells(om)])
        .then((data) => {
            const [headers, cells] = data;
            return getPlantsItems(
                headers,
                cells,
                "text",
                "start",
                "end",
                "status",
                "status.style"
            );
        })
        .then((scheduler) => JSON.stringify(scheduler));
});
