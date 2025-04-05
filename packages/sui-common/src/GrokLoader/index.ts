/**
 * Represents a default export for the GrokLoader component.
 * This component is responsible for loading and displaying data from a Grok backend.
 * @param {object} props - The props for the GrokLoader component.
 * @property {string} url - The URL to fetch data from.
 * @property {boolean} [loading] - Flag to indicate if data is currently being loaded.
 * @property {function} [onLoad] - Callback function to handle successful data loading.
 * @property {function} [onError] - Callback function to handle data loading errors.
 * @returns {JSX.Element} A React component that loads and displays data from a Grok backend.
 * @example
 * <GrokLoader url="https://example.com/data" loading={true} onLoad={handleLoad} onError={handleError} />
 */
import GrokLoader from './GrokLoader';

export default GrokLoader;