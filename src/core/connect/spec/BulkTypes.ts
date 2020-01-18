import {BaseFunction} from '../../block/BlockFunction';
import {Functions} from '../../block/Functions';

class TestFunction extends BaseFunction {}

TestFunction.prototype.priority = 0;
TestFunction.prototype.useLength = false;

let testDesc = {
  name: '',
  icon: 'fas:plus',
  useLength: true,
  properties: [
    {name: 'a', type: 'number', visible: 'high'},
    {name: 'b', type: 'number', visible: 'high'},
    {name: 'c', type: 'number', visible: 'high'},
    {name: 'd', type: 'number', visible: 'high'},
    {name: 'output', type: 'number', readonly: true}
  ]
};

export function addTestTypes(prefix: string, count: number) {
  for (let i = 0; i < count; ++i) {
    Functions.add(TestFunction, {...testDesc, name: `${prefix}${i}`} as any);
  }
}

export function removeTestTypes(prefix: string, count: number) {
  for (let i = 0; i < count; ++i) {
    Functions.clear(`${prefix}${i}`);
  }
}
