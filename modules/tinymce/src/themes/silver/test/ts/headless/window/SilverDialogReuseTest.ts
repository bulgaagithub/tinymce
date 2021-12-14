import { FocusTools } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, describe, it } from '@ephox/bedrock-client';
import { Dialog as BridgeSpec } from '@ephox/bridge';
import { Focus, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverDialogTest', () => {
  const store = TestHelpers.TestStore();
  const helpers = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let dialogApi: Dialog.DialogInstanceApi<{ fred: string; wilma?: string }>;
  before(() => {
    windowManager = WindowManager.setup(helpers.extras());
  });

  const baseDialogActions = {
    onSubmit: store.adder('onSubmit'),
    onClose: store.adder('onClose'),
    onChange: store.adder('onChange'),
    onAction: store.adder('onAction')
  };

  const baseDialogButtons: BridgeSpec.DialogFooterButtonSpec[] = [
    {
      type: 'custom',
      name: 'barny',
      text: 'Barny Text',
      align: 'start',
      primary: true
    }
  ];

  const openDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles'
      }
    }, {}, () => store.adder('closeWindow')());

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles'
    }, 'Initial data');
  };

  it('Open a dialog, assert initial focus, redial with similar data, check focus maintained', async () => {
    openDialogAndAssertInitialData();
    await FocusTools.pTryOnSelector(
      'Focus should start on the input',
      SugarDocument.getDocument(),
      'input'
    );

    // Tag the element
    Focus.active().each(
      (se) => {
        (se.dom as any).GOOSE = 'goose';
      }
    );

    // eslint-disable-next-line no-console
    console.log('Preactive: ', Focus.active().getOrDie().dom);

    dialogApi.redial({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          },
          {
            type: 'input',
            name: 'wilma',
            label: 'Wilmas input'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles',
        wilma: 'new things'
      }
    });

    await FocusTools.pTryOnSelector(
      'Focus should stay on the input after redial',
      SugarDocument.getDocument(),
      'input'
    );

    // eslint-disable-next-line no-console
    console.log('active', Focus.active().getOrDie().dom);
    assert.equal((Focus.active().getOrDie('Focused element').dom as any).GOOSE, 'goose');

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles',
      wilma: 'new things'
    }, 'Initial data');
  });
});
