import * as React from 'react';
import randomBytes from 'randombytes';

function randomString(length: number) {
  if (length % 2 !== 0) {
    length++;
  }
  return randomBytes(length / 2).toString("hex");
}


export function IdGenerator() {
  const generateId = (prefix: string, id: string = '', length: number = 7) => {
    return `${prefix}-${id}-${randomString(length)}`;
  };
  return {id: (id?: string, length?: number) => generateId('id', id, length)};
}
