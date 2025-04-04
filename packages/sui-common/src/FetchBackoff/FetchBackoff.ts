/**
 * @typedef {Object} FetchWithBackoffOptions
 * @property {number} [retries=3] - Maximum number of retries before failing.
 * @property {number} [backoffFactor=2] - Multiplier for backoff delay between retries.
 * @property {number} [initialDelay=500] - Initial delay in milliseconds before the first retry.
 * @property {(response: Response | null, error: any) => boolean} [retryCondition] - Function to determine whether to retry the fetch operation.
 * Determines if a retry should occur based on the response and error.
 */

/**
 * FetchBackoff performs a fetch request with automatic retries and exponential backoff.
 * 
 * @param {RequestInfo} input - The input to the fetch request, typically a URL or a Request object.
 * @param {RequestInit} [init] - An options object containing any custom settings that you want to apply to the request.
 * @param {FetchWithBackoffOptions} [options] - Custom options to control retry behavior.
 * @returns {Promise<Response>} A promise that resolves to the Response of the fetch request.
 * @throws {Error} Throws an error if the fetch fails after the maximum number of retries.
 * @example
 * // Basic usage
 * FetchBackoff('https://api.example.com/data')
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Fetch failed', error));
 * 
 * @example
 * // Custom options
 * FetchBackoff('https://api.example.com/data', undefined, { retries: 5, initialDelay: 1000 })
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Fetch failed', error));
 */
const FetchBackoff = async (
  input: RequestInfo,
  init?: RequestInit,
  options?: FetchWithBackoffOptions
): Promise<Response> => {
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
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(input, init);

      // If response is OK or retryCondition is false, return the response
      if (!retryCondition(response, null)) {
        return response;
      }
    } catch (error) {
      // If retryCondition is false, throw the error
      if (!retryCondition(null, error)) {
        console.error('FetchBackoff', error);
      } else if (attempt === retries) {
        console.error('FetchBackoff', error, 'retries: ', retries); // Rethrow the error after final attempt
      }
    }

    // Wait for the backoff delay before retrying
    // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
    await new Promise((resolve) => {
      setTimeout(resolve, delay)
    });
    delay *= backoffFactor;
    // eslint-disable-next-line no-plusplus
    attempt++;
  }

  // If the loop exits without returning, throw an error
  throw new Error("Fetch failed after maximum retries.");
};

export {FetchBackoff};