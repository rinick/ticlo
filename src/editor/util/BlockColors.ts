import {globalStyle} from '../../../src/html/style/CssRules';
import {FunctionDesc} from '../../core';
import {ClientConn} from '../../core/connect/ClientConn';

const usedColors = new Set<string>();

const colorReg = /^[a-f0-9]{3}$/;
function brighterColor(c: string) {
  return 255 - ((255 - Number(`0x${c}`) * 17) >> 1);
}
export function addBlockColor(color: string) {
  if (usedColors.has(color)) {
    return;
  }
  if (!colorReg.test(color)) {
    return;
  }
  usedColors.add(color);
  let rr = brighterColor(color.substring(0, 1));
  let gg = brighterColor(color.substring(1, 2));
  let bb = brighterColor(color.substring(2, 3));
  globalStyle.addRule(`.ticl-block--${color}{border-color: #${color};}`);
  globalStyle.addRule(`.ticl-block--${color} .ticl-block-prbg, .ticl-bg--${color}{background: #${color};}`);
  globalStyle.addRule(`.ticl-block--${color}.ticl-block-selected{box-shadow: 0 0 4px 3px rgb(${rr},${gg},${bb});}`);
}

const priorityColors = ['4af', '1bb', '8c1', 'f72'];
export function getFuncStyleFromDesc(desc: FunctionDesc, conn: ClientConn, prefix = 'ticl-block--'): [string, string] {
  let color = '999';
  let icon: string;
  if (desc) {
    ({color, icon} = desc);
    if (!color || !icon) {
      let category = desc.ns || desc.category;
      if (category) {
        let catDesc = conn.watchDesc(category);
        if (catDesc) {
          color = color || catDesc.color;
          icon = icon || catDesc.icon;
        }
      }
    }
  }
  addBlockColor(color);
  return [prefix + color, icon];
}
