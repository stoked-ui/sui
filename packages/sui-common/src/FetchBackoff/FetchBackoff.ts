/**
 * Options for fetching data with backoff.
 *
 * @interface FetchWithBackoffOptions
 */
type FetchWithBackoffOptions = {
  /**
   * Maximum number of retries. If not provided, defaults to 3.
   */
  retries?: number; 
  /**
   * Multiplier for backoff delay. If not provided, defaults to 2.
   */
  backoffFactor?: number; 
  /**
   * Initial delay in milliseconds. If not provided, defaults to 500.
   */
  initialDelay?: number; 

  /**
   * Function to determine whether to retry the request.
   *
   * @param response Response object or null
   * @param error Error object
   * @returns True if the request should be retried, false otherwise
   */
  retryCondition?: (response: Response | null, error: any) => boolean; 
};

/**
 * Fetches data with backoff.
 *
 * @async
 * @function FetchBackoff
 * @param {RequestInfo} input - The URL to fetch
 * @param {RequestInit} [init] - The request options
 * @param {FetchWithBackoffOptions} [options] - The backoff options
 * @returns {Promise<Response>} A promise resolving to the response object
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

  /**
   * Loop until the maximum number of retries is reached
   */
  while (attempt <= retries) {
    try {
      // Fetch the data
      const response = await fetch(input, init);

      // If the response is OK or retryCondition is false, return the response
      if (!retryCondition(response, null)) {
        return response;
      }
    } catch (error) {
      // If retryCondition is false, throw the error
      if (!retryCondition(null, error)) {
        console.error('FetchBackoff', error);
      } else if (attempt === retries) {
        console.error('FetchBackoff', error, 'retries: ', retries); 
        // Rethrow the error after final attempt
      }
    }

    // Wait for the backoff delay before retrying
    await new Promise((resolve) => {
      setTimeout(resolve, delay)
    });
    delay *= backoffFactor;
    // Increment the attempt counter
    attempt++;
  }

  /**
   * If the loop exits without returning, throw an error
   */
  throw new Error("Fetch failed after maximum retries.");
};