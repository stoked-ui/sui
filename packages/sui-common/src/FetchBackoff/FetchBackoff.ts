/**
 * Options for fetch with backoff functionality.
 *
 * @typedef {Object} FetchWithBackoffOptions
 * @property {number} [retries=3] Maximum number of retries before giving up.
 * @property {number} [backoffFactor=2] Multiplier for backoff delay.
 * @property {number} [initialDelay=500] Initial delay in milliseconds before making the first request.
 * @property {(response: Response | null, error: any) => boolean} [retryCondition] Function to determine whether to retry after an error or a successful response.
 */
type FetchWithBackoffOptions = {
  /**
   * Maximum number of retries before giving up.
   *
   * Defaults to 3.
   */
  retries?: number;
  
  /**
   * Multiplier for backoff delay.
   *
   * Defaults to 2.
   */
  backoffFactor?: number;
  
  /**
   * Initial delay in milliseconds before making the first request.
   *
   * Defaults to 500ms.
   */
  initialDelay?: number;
  
  /**
   * Function to determine whether to retry after an error or a successful response.
   *
   * If null, will use a default condition where only errors are retried and responses with a non-OK status code are never retried.
   */
  retryCondition?: (response: Response | null, error: any) => boolean;
};

/**
 * Fetches a resource with backoff functionality to handle retries and delays between requests.
 *
 * @async
 * @param {RequestInfo} input The URL or request information for the fetch operation.
 * @param {RequestInit} [init] Optional initial settings for the fetch request.
 * @param {FetchWithBackoffOptions | object} [options] Options for fetch with backoff functionality.
 * @returns {Promise<Response>} A promise resolving to the HTTP response from the server, or an error if all retries fail.
 */
const FetchBackoff = async (
  input: RequestInfo,
  init?: RequestInit,
  options?: FetchWithBackoffOptions
): Promise<Response> => {
  // Extract and default values for options
  const { 
    retries = 3, // maximum number of retries before giving up
    backoffFactor = 2, // multiplier for backoff delay
    initialDelay = 500, // initial delay in milliseconds before making the first request
    retryCondition = (response, error) =>
      !!error || (response ? !response.ok : false), // function to determine whether to retry after an error or a successful response
  } = options || {};

  let attempt = 0; // current attempt number
  let delay = initialDelay; // backoff delay in milliseconds

  /**
   * Fetches the resource with backoff functionality.
   */
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

export { FetchBackoff };