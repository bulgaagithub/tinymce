/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optionals } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Compare, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const getNodeName = (elm: Node): string =>
  elm.nodeName.toLowerCase();

const getBody = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const getIsRoot = (editor: Editor) => (element: SugarElement<Node>): boolean =>
  Compare.eq(element, getBody(editor));

const removePxSuffix = (size: string): string =>
  size ? size.replace(/px$/, '') : '';

const addPxSuffix = (size: string): string =>
  /^\d+(\.\d+)?$/.test(size) ? size + 'px' : size;

const getSelectionStart = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getStart());

const getSelectionEnd = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getEnd());

const isTableCell = (node: Element): node is HTMLTableCellElement => {
  const name = node.nodeName.toLowerCase();
  return name === 'td' || name === 'th';
};

const isSelectionWithinTable = (editor: Editor) => {
  const startTableOpt = TableLookup.table(getSelectionStart(editor), getIsRoot(editor));
  const endTableOpt = TableLookup.table(getSelectionEnd(editor), getIsRoot(editor));
  return Optionals.equals(startTableOpt, endTableOpt, Compare.eq);
};

export {
  getNodeName,
  getBody,
  getIsRoot,
  addPxSuffix,
  removePxSuffix,
  getSelectionStart,
  getSelectionEnd,
  isTableCell,
  isSelectionWithinTable
};
