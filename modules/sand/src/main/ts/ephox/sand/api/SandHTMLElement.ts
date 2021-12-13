import { Type } from '@ephox/katamari';

const isPrototypeOf = (x: any): x is HTMLElement => {
  return Type.isObject(x) && (/^\[object HTML\w*Element\]$/.test(x.prototype.constructor.name));
};

export {
  isPrototypeOf
};
