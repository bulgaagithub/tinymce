/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// import { Selections } from '@ephox/darwin';
// import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Clipboard from './actions/Clipboard';
import { getResizeHandler } from './actions/ResizeHandler';
import { TableActions } from './actions/TableActions';
import { Api, getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as QueryCommands from './api/QueryCommands';
// import { hasTabNavigation } from './api/Settings';
import { Clipboard as FakeClipboard } from './core/Clipboard';
import * as TableFormats from './core/TableFormats';
// import * as Util from './core/Util';
// import * as TabContext from './queries/TabContext';
// import CellSelection from './selection/CellSelection';
import { ephemera } from './selection/Ephemera';
import { getSelectionTargets } from './selection/SelectionTargets';
// import { getSelectionCell } from './selection/TableSelection';

export interface PatchedSelections {
  readonly get: () => SugarElement<HTMLTableCellElement>[];
}

// const patchSelections = (selections: Selections): PatchedSelections => {
//   return {
//     get: () => selections.get().fold(Fun.constant([]), Fun.identity, Arr.pure)
//   };
// };

const setupTable = (editor: Editor): Api => {
  // Move selection and resizing logic to actual core
  // const oldSelections = Selections(() => Util.getBody(editor), () => getSelectionCell(Util.getSelectionStart(editor), Util.getIsRoot(editor)), ephemera.selectedSelector);
  // const selections = patchSelections(oldSelections);

  const selectionTargets = getSelectionTargets(editor);
  const resizeHandler = getResizeHandler(editor);
  // const resizeHandler = editor.selection.tableResizeHandler;
  // console.log(resizeHandler);
  // TODO: I don't think we want CellSelection here as the selection should be in core but leave here for now
  // const cellSelection = CellSelection(editor, selectionTargets, resizeHandler.lazyResize);
  // const cellSelection = CellSelection(editor, resizeHandler.lazyResize);
  // const actions = TableActions(editor, cellSelection, resizeHandler.lazyWire);

  // TODO: To solve resizeHandler issue, could put register all of this on init to allow Editor to initialise ResizeHandler but doesn't seem like a great solution

  const actions = TableActions(editor, resizeHandler.lazyWire);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, clipboard);
  QueryCommands.registerQueryCommands(editor, actions);
  // TODO: Maybe move to core. Although, will need RTC to have that working first
  Clipboard.registerEvents(editor, actions);

  // TODO: Maybe expose ephemera as an API of the table model
  editor.on('PreInit', () => {
    editor.serializer.addTempAttr(ephemera.firstSelected);
    editor.serializer.addTempAttr(ephemera.lastSelected);
    TableFormats.registerFormats(editor);
  });

  // TODO: Move to core - keyboard overrides
  // if (hasTabNavigation(editor)) {
  // editor.on('keydown', (e: KeyboardEvent) => {
  // TabContext.handle(e, editor, cellSelection);
  // TabContext.handle(e, editor);
  // });
  // }

  editor.on('remove', () => {
    resizeHandler.destroy();
  });

  // TODO: Attempt making the API just in the internal APIs
  // Maybe add ephemera to the API as well
  // return getApi(clipboard, resizeHandler, selectionTargets, cellSelection);
  return getApi(clipboard, resizeHandler, selectionTargets);
};

export {
  setupTable
};
