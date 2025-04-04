/**
 * Options for fetch with backoff.
 */
type FetchWithBackoffOptions = {
  /**
   * Maximum number of retries.
   */
  retries?: number;

  /**
   * Multiplier for backoff delay.
   */
  backoffFactor?: number;

  /**
   * Initial delay in milliseconds.
   */
  initialDelay?: number;

  /**
   * Function to determine whether to retry. It receives the response and error as arguments.
   * @param {Response | null} response The response from the fetch request.
   * @param {any} error The error that occurred during the fetch request.
   * @returns {boolean} Whether to retry or not.
   */
  retryCondition?: (response: Response | null, error: any) => boolean;
};

/**
 * Fetches a resource with backoff logic. It retries the request if it fails and waits for a delay between attempts.
 *
 * @param {RequestInfo} input The URL of the resource to fetch.
 * @param {RequestInit} [init] The options for the fetch request.
 * @param {FetchWithBackoffOptions} [options] Options for fetch with backoff.
 * @returns {Promise<Response>} A promise that resolves with the response from the fetch request or throws an error if all retries fail.
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

export { FetchBackoff };