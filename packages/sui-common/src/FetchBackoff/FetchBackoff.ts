/**
 * Options for fetch with backoff functionality.
 */
type FetchWithBackoffOptions = {
  /**
   * Maximum number of retries before giving up.
   */
  retries?: number;

  /**
   * Multiplier for backoff delay.
   */
  backoffFactor?: number;

  /**
   * Initial delay in milliseconds before making the first request.
   */
  initialDelay?: number;

  /**
   * Function to determine whether to retry after an error or a successful response.
   *
   * @param response The HTTP response from the server.
   * @param error The error that occurred during the request.
   * @returns True if the request should be retried, false otherwise.
   */
  retryCondition?: (response: Response | null, error: any) => boolean;
};

/**
 * Fetches a resource with backoff functionality to handle retries and delays between requests.
 *
 * @param input The URL or request information for the fetch operation.
 * @param init Optional initial settings for the fetch request.
 * @param options Options for fetch with backoff functionality. See FetchWithBackoffOptions.
 * @returns A promise resolving to the HTTP response from the server, or an error if all retries fail.
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