import React from "react";
import { MuiDemo } from "./MuiDemo";
import { BasicDemo } from "./BasicDemo";
import { MediaProvider } from "../../src";
const FileUploadDemo: React.FC = () => {
	try {
		// Attempt to import the peer dependency
		import('@mui/material');

		return <MuiDemo />
	} catch (e) {
		// Handle the case where the peer dependency is not available
		console.error('Peer dependency not found or failed to load:', e);
	}

	return <BasicDemo/>;
};
export const Demo = () => {
	return (
		<div>
			<h1>Media Selector Demo</h1>
			<MediaProvider>
			<FileUploadDemo />
			</MediaProvider>
		</div>
	);
}
