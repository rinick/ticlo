import React from 'react';
import VirtualList from '../component/Virtual';
import {ObjectTreeItem, ObjectTreeRenderer} from './ObjectRenderer';
import {ClientConn} from '../../core/connect/ClientConn';
import {LazyUpdateComponent} from '../component/LazyUpdateComponent';

interface Props {
  conn: ClientConn;
  data: object;
  style?: React.CSSProperties;
}

export class ObjectTree extends LazyUpdateComponent<Props, any> {
  root: ObjectTreeItem;
  list: ObjectTreeItem[] = [];

  renderChild = (idx: number, style: React.CSSProperties) => {
    const item = this.list[idx];
    return <ObjectTreeRenderer item={item} key={item.key} style={style} />;
  };

  refreshList() {
    this.list.length = 0;
    this.root.addToList(this.list);
  }

  constructor(props: Props) {
    super(props);
    this.buildRoot();
  }

  forceUpdateLambda = () => this.forceUpdate();

  buildRoot() {
    this.root = new ObjectTreeItem('', this.props.data, null);
    this.root.connection = this.props.conn;
    this.root.onListChange = this.forceUpdateLambda;
    if (this.root.opened === 'closed') {
      this.root.open();
    }
  }

  renderImpl() {
    this.refreshList();
    return (
      <VirtualList
        className="ticl-node-tree"
        style={this.props.style}
        renderer={this.renderChild}
        itemCount={this.list.length}
        itemHeight={30}
      />
    );
  }

  componentWillUnmount(): void {
    this.root.destroy();
    super.componentWillUnmount();
  }
}
