/**
 * Represents the tabs component for the editor.
 *
 * @description Displays tabs for each file open in the editor.
 *
 * @param {object} props - The props for the EditorFileTabs component.
 * @property {string} activeFileId - The id of the currently active file.
 * @property {Array<object>} files - The array of files to display as tabs.
 * @property {function} onTabClick - The function to call when a tab is clicked.
 *
 * @returns {JSX.Element} React component representing the editor file tabs.
 *
 * @example
 * <EditorFileTabs
 *    activeFileId="123"
 *    files={[{ id: "123", name: "file1.js" }, { id: "456", name: "file2.css" }]}
 *    onTabClick={handleTabClick}
 * />
 */
import EditorFileTabs from "./EditorFileTabs";

export default EditorFileTabs;