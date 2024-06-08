const ENV = require("../ENV");
const { sendSelectorValue, sendNewDates } = require("../modules/om.js");

OM.web("sendData", async (request) => {
    const om = await OM.connectAsync(
        ENV.HOST,
        ENV.WSS,
        ENV.TOKEN,
        ENV.MODEL_ID
    );
    
    // return JSON.stringify(await om.common.modelInfo().nameAsync())
    const { query } = request;

    //если отправляем фильтр
    if (query.version) {
        const data = await sendSelectorValue(om, ENV.MULTICUBE_SELECTOR, ENV.CUBE_SELECTOR, query.version);
        return JSON.stringify(data)
    } else {

        //отправка при onMove
        const { plantId, numId, start, startTime, end, endTime } = query;
        const data = await sendNewDates(
            om,
            ENV.MULTICUBE_MAIN_COMMON,
            ENV.MULTICUBE_MAIN_COMMON_VIEW_SEND,
            plantId,
            numId,
            start,
            startTime,
            end,
            endTime,
        )
        return JSON.stringify(data)
    }
});
