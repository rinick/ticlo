import * as React from "react";

import {Dropdown, Button, Input, Icon, Menu, InputNumber} from "antd";
import {ExpandIcon, ExpandState, TreeRenderer, TreeItem} from "../../ui/component/Tree";
import {DataMap} from "../../common/util/Types";
import {ClientConnection} from "../../common/connect/ClientConnection";

export class NodeTreeItem extends TreeItem {
  onListChange: () => void;
  connection: ClientConnection;

  level: number;
  key: string;
  childPrefix: string;
  name: string;

  max: number = 32;

  constructor(name: string, parent?: NodeTreeItem) {
    super();
    if (!parent) {
      // root element;
      this.level = 0;
      if (name) {
        this.key = name;
        this.childPrefix = `${name}.`;
        this.name = name.substr(name.indexOf('.') + 1);
      } else {
        this.key = '';
        this.childPrefix = '';
        this.name = 'Root';
      }
    } else {
      this.level = parent.level + 1;
      this.key = `${parent.childPrefix}${name}`;
      this.childPrefix = `${this.key}.`;
      this.name = name;

      this.connection = parent.connection;
      this.onListChange = parent.onListChange;
    }
  }

  addToList(list: TreeItem[]) {
    super.addToList(list);
    // TODO
  }

  listingId: string;

  open() {
    if (this.opened === 'loading') {
      return;
    }
    if (this.children) {
      this.opened = 'opened';
      if (this.onListChange && this.children.length) {
        this.onListChange();
      }
    } else {
      this.opened = 'loading';
      this.listingId = this.connection.listChildren(this.key, null, this.max, this) as string;
    }
    if (this._renderer) {
      this._renderer.forceUpdate();
    }
  }

  close() {
    this.cancelLoad();
    this.opened = 'closed';
    if (this._renderer) {
      this._renderer.forceUpdate();
    }
    if (this.onListChange && this.children && this.children.length) {
      this.onListChange();
    }
  }

  reload() {
    this.cancelLoad();
    this.opened = 'loading';
    this.listingId = this.connection.listChildren(this.key, null, this.max, this) as string;
    if (this._renderer) {
      this._renderer.forceUpdate();
    }
  }

  // on children update
  onUpdate(response: DataMap): void {
    this.destroyChildren();
    this.children = [];
    if (this.listingId) {
      this.listingId = null;
    }
    let children: DataMap = response.children;
    for (let key in children) {
      let newItem = new NodeTreeItem(key, this);
      this.children.push(newItem);
    }
    this.opened = 'opened';
    if (this.onListChange) {
      this.onListChange();
    }
    if (this._renderer) {
      this._renderer.forceUpdate();
    }
  }

  // on children error
  onError(error: string, data?: DataMap): void {
    // TODO: show error
  }

  cancelLoad() {
    if (this.listingId) {
      this.connection.cancel(this.listingId);
      this.listingId = null;
    }
  }

  destroy() {
    this.cancelLoad();
    this.destroyChildren();
  }
}

interface Props {
  item: NodeTreeItem;
  style: React.CSSProperties;
}

interface State {

}

export class NodeTreeRenderer extends TreeRenderer<Props, State> {

  onExpandClicked = () => {
    switch (this.props.item.opened) {
      case 'opened':
        this.props.item.close();
        break;
      case 'closed':
      case 'empty':
        this.props.item.open();
        break;
    }
  };
  onReloadClicked = (event?: MouseEvent) => {
    this.props.item.reload();
  };

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    let {item, style} = this.props;
    let marginLeft = item.level * 24;
    return (
      <div style={{...style, marginLeft}} className="ticl-tree-node">
        <ExpandIcon opened={item.opened} onClick={this.onExpandClicked}/>

        <Dropdown overlay={
          <Menu prefixCls="ant-dropdown-menu" selectable={false}>
            <Menu.Item onClick={this.onReloadClicked}>
              <div className="fas fa-sync-alt ticl-icon"/>
              Reload
            </Menu.Item>
            <Menu.Item >
              <div className="fas fa-search ticl-icon"/>
              Search
            </Menu.Item>
          </Menu>
        } trigger={['contextMenu']}>
          <div className="ticl-tree-node-text">{item.name}</div>
        </Dropdown>
      </div>
    );
  }
}