import randomBytes from 'randombytes';

function randomString(length: number) {
  if (length % 2 !== 0) {
    length++;
  }
  return randomBytes(length / 2).toString("hex");
}

const increment: Record<string, number> = {};

export const IdGenerator = () => {
  const generateId = (prefix: string, id: string = '', length: number = 7) => {
    return `${prefix}-${id}-${randomString(length)}`;
  };
  const generateInc = (prefix: string, id: string = '', length: number = 3) => {
    const incrementId = `${prefix}-${id}`;
    if (!increment[incrementId]){
      increment[incrementId] = 0;
    } else {
      increment[incrementId] += 1;
    }

    return `${incrementId}-${String(increment[incrementId]).padStart(length, "0")}`;
  };
  const rowId = (id?: string, length?: number) => generateId('row', id, length);
  const actionId = (id?: string, length?: number) => generateId('action', id, length);
  const fileId = (id?: string, length?: number) => generateId('file', id, length);
  const id = (id?: string, length?: number) => generateId('id', id, length);
  const rowInc = (id?: string, length?: number) => generateInc('row', id, length);
  const actionInc = (id?: string, length?: number) => generateInc('action', id, length);
  const fileInc = (id?: string, length?: number) => generateInc('file', id, length);
  const inc = (id?: string, length?: number) => generateInc('id', id, length);
  return {
    rowId,
    fileId,
    actionId,
    id,
    rowInc,
    fileInc,
    actionInc,
    inc
  };
};
