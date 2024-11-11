import * as React from "react";
import { TimelineContext } from "@stoked-ui/timeline";
import { type EditorContextType } from "./EditorProvider.types";

export function useEditorContext(): EditorContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context as EditorContextType;
}

