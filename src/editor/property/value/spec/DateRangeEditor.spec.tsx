import expect from 'expect';
import SimulateEvent from 'simulate-event';
import React from 'react';
import {removeLastTemplate, loadTemplate, querySingle, fakeMouseEvent} from '../../../util/test-util';
import {initEditor} from '../../../index';
import {DateRangeEditor} from '../DateRangeEditor';
import {shouldHappen, waitTick} from '../../../../../src/core/util/test-util';
import {blankFuncDesc, blankPropDesc, PropDesc} from '../../../../../src/core/editor';
import moment, {Moment} from 'moment';
import {DateEditor} from '../DateEditor';

describe('DateRangeEditor', function () {
  beforeEach(async function () {
    await initEditor();
  });

  afterEach(async function () {
    removeLastTemplate();
  });

  it('basic', async function () {
    let values: Moment[] = null;
    let onChange = (v: Moment[]) => {
      values = v;
    };
    let desc: PropDesc = {name: '', type: 'date-range', showTime: false};
    let [component, div] = loadTemplate(
      <DateRangeEditor value={null} funcDesc={blankFuncDesc} desc={desc} onChange={onChange} />,
      'editor'
    );

    await shouldHappen(() => div.querySelector('.ticl-date-range-editor > div'), 500);
    let dateRangeDiv = div.querySelector('.ticl-date-range-editor > div');

    // don't run the following test because of issue that karma skipping tests after this one
    window.onerror = function (e) {};

    SimulateEvent.simulate(dateRangeDiv.querySelector('input'), 'mousedown', fakeMouseEvent());

    await shouldHappen(() => document.querySelector('.ant-picker-panels'));
    let dateCell = document.querySelector('.ant-picker-cell-today');
    let dateStr = (dateCell as HTMLElement).title;
    // click twice
    SimulateEvent.simulate(dateCell, 'click');
    await waitTick(1);
    SimulateEvent.simulate(dateCell, 'click');

    await shouldHappen(() => values != null);
    let clickedMoment = moment(dateStr, 'YYYY-MM-DD');
    expect(clickedMoment.isSameOrBefore(values[0])).toBe(true);
    expect(clickedMoment.isBefore(values[1])).toBe(true);
  });
});
