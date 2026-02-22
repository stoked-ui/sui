"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchBackoff = void 0;
const FetchBackoff = async (input, init, options) => {
    const { retries = 3, backoffFactor = 2, initialDelay = 500, retryCondition = (response, error) => !!error || (response ? !response.ok : false), } = options || {};
    let attempt = 0;
    let delay = initialDelay;
    while (attempt <= retries) {
        try {
            const response = await fetch(input, init);
            if (!retryCondition(response, null)) {
                return response;
            }
        }
        catch (error) {
            if (!retryCondition(null, error)) {
                console.error('FetchBackoff', error);
            }
            else if (attempt === retries) {
                console.error('FetchBackoff', error, 'retries: ', retries);
            }
        }
        await new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
        delay *= backoffFactor;
        attempt++;
    }
    throw new Error("Fetch failed after maximum retries.");
};
exports.FetchBackoff = FetchBackoff;
//# sourceMappingURL=FetchBackoff.js.map