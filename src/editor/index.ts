export * from './block/BlockStage';
export * from './property/PropertyList';
export * from './node-tree/NodeTree';

import * as ticloI18n from '../../src/core/editor';

// register special view

import './block/view/NoteView';
import './block/view/SliderWidget';
import './block/view/NoteWidget';

export async function initEditor() {
  let lng = window.localStorage.getItem('ticlo-lng');
  await ticloI18n.init(lng);
}
