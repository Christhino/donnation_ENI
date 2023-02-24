import { cleanObject as tinyCleanObject } from 'tiny-clean-object';

export const cleanObject = (obj: any) => {
  if (typeof obj === 'object') {
    return tinyCleanObject(obj, {
      emptyArrays: true,
      emptyInvalidNumbers: true,
      emptyObjects: true,
      emptyStrings: true,
      deep: true,
    });
  }

  return obj;
};
