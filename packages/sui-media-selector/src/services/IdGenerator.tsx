import randomBytes from 'randombytes';

function randomString(length: number) {
  if (length % 2 !== 0) {
    length++;
  }
  return randomBytes(length / 2).toString("hex");
}

export const IdGenerator = () => {
  const generateId = (prefix: string, id: string = '', length: number = 7) => {
    return `${prefix}-${id}-${randomString(length)}`;
  };
  const rowId = (id?: string, length?: number) => generateId('row', id, length);
  const actionId = (id?: string, length?: number) => generateId('action', id, length);
  const fileId = (id?: string, length?: number) => generateId('file', id, length);
  const id = (id?: string, length?: number) => generateId('id', id, length);
  return {
    rowId,
    fileId,
    actionId,
    id,
  };
};
