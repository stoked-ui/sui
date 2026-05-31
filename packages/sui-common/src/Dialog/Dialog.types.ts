import type * as React from 'react';

export interface ConfirmOptions {
  title?: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface PromptOptions {
  title?: React.ReactNode;
  message?: React.ReactNode;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  multiline?: boolean;
  validate?: (value: string) => string | null;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface PromptDialogProps extends PromptOptions {
  open: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;
export type PromptFn = (options: PromptOptions | string) => Promise<string | null>;

export interface DialogContextValue {
  confirm: ConfirmFn;
  prompt: PromptFn;
}
