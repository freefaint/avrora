import { FC } from "react";

export type Controlled<T> = {
  value: T;
  onChange: (value: T) => void;
};

export enum DialogType {
  Confirm = 'confirm',
  Alert = 'alert',
  Error = 'error',
  Form = 'form',
}

export type FormBody = Record<string, any>;

export enum ErrorType {
  Data = 'data',
  Server = 'server',
}

export interface DataError {
  name: string;
  type: ErrorType.Data;
  condition: (data: FormBody) => boolean;
  string: string;
}

export interface ServerError {
  name: string;
  type: ErrorType.Server;
  condition: (data: any) => boolean;
  string: (data: any) => string;
}

export type FormError = DataError | ServerError;

export type FormErrorDump = {
  errors?: Omit<DataError, 'condition' | 'type'>[];
};

interface ILinl {
  name: string;
  path: string;
}

export interface DialogCommonProps {
  link?: ILinl;
  title?: React.ReactNode;
  text?: FC<{ onClose: () => void }> | React.ReactNode;
  img?: React.ReactNode;
  type: DialogType;
  confirmText?: string;
  width?: string;
  confirmColor?: string;
  confirmHoverColor?: string;
  followData?: boolean;
  cancelText?: string;
  withoutButtons?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
}

export interface DialogInfoProps {
  type: DialogType.Alert | DialogType.Error;
}

export interface DialogConfirmProps {
  type: DialogType.Confirm;
}

export interface DialogFormProps {
  type: DialogType.Form;
  initialValue?: FormBody;
  form: React.FC<Controlled<FormBody> & FormErrorDump>;
  handler: (data: FormBody) => Promise<any>;
  onCancel?: () => void;
}

export interface DialogFormConfirmCommonProps {
  type: DialogType.Form | DialogType.Confirm;
  onSubmit?: () => void;
  onCancel?: () => void;
  initialData?: FormBody;
  errors?: FormError[];
  hideCancel?: boolean;
  submitEnabled?: (data: FormBody) => boolean;
  cancelText?: string;
}

export type DialogFormConfirmProps = DialogFormConfirmCommonProps & (DialogConfirmProps | DialogFormProps);

export type DialogProps = DialogCommonProps & (DialogFormConfirmProps | DialogInfoProps);

export interface DialogContextProps {
  push: (body: DialogProps) => void;
}
