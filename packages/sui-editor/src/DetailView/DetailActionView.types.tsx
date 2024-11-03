/*
import * as React from "react";
import * as yup from "yup";
import { DetailSelection } from "./Detail";

export const getActionSchema = () => {
  const schemaObj = {
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    start: yup.number().required('Start is required'),
    end: yup.number().required('End is required'),
    x: yup.number().optional(),
    y: yup.number().optional(),
    z: yup.number().required(),
    width: yup.number().required(),
    height: yup.number().required(),
  };
  return yup.object(schemaObj);
};

export interface IDetailAction {
  id: string;
  name: string;
  start: number;
  end: number;
  x?: number;
  y?: number;
  z: number;
  width: number;
  height: number;
}

export function getActionFormData(detail: DetailSelection): IDetailAction | undefined {
  const { action } = detail;
  if (action && !action.id) {
    throw new Error('can not load detail action view without a action id');
  }

  return action ? {
    id: action.id,
    name: action.name ?? '',
    start: action.start,
    end: action.end,
    x: action.x,
    y: action.y,
    z: action.z,
    width: action.width,
    height: action.height,
  } : undefined;
}
*/
