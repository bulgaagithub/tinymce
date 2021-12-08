/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optionals } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Attribute, Compare, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const getBody = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const getIsRoot = (editor: Editor) => (element: SugarElement<Node>): boolean =>
  Compare.eq(element, getBody(editor));

const removeDataStyle = (table: SugarElement<HTMLTableElement>): void => {
  Attribute.remove(table, 'data-mce-style');

  const removeStyleAttribute = (element: SugarElement<HTMLElement>) => Attribute.remove(element, 'data-mce-style');

  Arr.each(TableLookup.cells(table), removeStyleAttribute);
  Arr.each(TableLookup.columns(table), removeStyleAttribute);
  Arr.each(TableLookup.rows(table), removeStyleAttribute);
};

const getSelectionStart = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getStart());

const getSelectionEnd = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getEnd());

const isTableCell = (node: Element): node is HTMLTableCellElement => {
  const name = node.nodeName.toLowerCase();
  return name === 'td' || name === 'th';
};

const isSelectionWithinTable = (editor: Editor) => {
  const startTableOpt = TableLookup.table(getSelectionStart(editor));
  const endTableOpt = TableLookup.table(getSelectionEnd(editor));
  return Optionals.equals(startTableOpt, endTableOpt, Compare.eq);
};

export {
  getBody,
  getIsRoot,
  removeDataStyle,
  getSelectionStart,
  getSelectionEnd,
  isTableCell,
  isSelectionWithinTable
};
