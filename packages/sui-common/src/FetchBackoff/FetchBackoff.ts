/**
 * Options for FetchBackoff function.
 * @typedef {Object} FetchWithBackoffOptions
 * @property {number} [retries] - Maximum number of retries
 * @property {number} [backoffFactor] - Multiplier for backoff delay
 * @property {number} [initialDelay] - Initial delay in milliseconds
 * @property {(response: Response | null, error: any) => boolean} [retryCondition] - Function to determine whether to retry
 */

/**
 * Fetch data with backoff strategy for retries.
 * @param {RequestInfo} input - Request URL or object
 * @param {RequestInit} [init] - Request options
 * @param {FetchWithBackoffOptions} [options] - Options for fetch with backoff
 * @returns {Promise<Response>} - Promise resolving to a Response object
 */
const FetchBackoff = async (input, init, options) => {
  const {
    retries = 3,
    backoffFactor = 2,
    initialDelay = 500,
    retryCondition = (response, error) =>
      !!error || (response ? !response.ok : false),
  } = options || {};

  let attempt = 0;
  let delay = initialDelay;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init);

      if (!retryCondition(response, null)) {
        return response;
      }
    } catch (error) {
      if (!retryCondition(null, error)) {
        console.error('FetchBackoff', error);
      } else if (attempt === retries) {
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

export {FetchBackoff};
