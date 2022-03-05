import {Uid} from '../util/Uid';

export enum EventType {
  TRIGGER = 0,
  ERROR = 1,
  VOID = 2, // void event should be ignored
}

export class Event {
  static _uid = new Uid();
  static get uid(): string {
    return Event._uid.current;
  }

  loopId: string;
  type: string;
  /** When a Block is disabled, whether the event should be passed to next block in sync mode */
  passThrough: boolean;

  constructor(type: string) {
    this.type = type;
    this.loopId = Event.uid;
  }

  static check(val: any): EventType {
    if (val == null) {
      return EventType.VOID;
    }
    if (val instanceof Event) {
      return val.check();
    }
    return EventType.TRIGGER;
  }
  static passThrough(val: any): boolean {
    return val instanceof Event && val.passThrough;
  }

  check(): number {
    if (this.loopId === Event.uid) {
      return EventType.TRIGGER;
    }
    return EventType.VOID;
  }
}

export class ErrorEvent extends Event {
  detail: any;
  passThrough = true;

  constructor(type: string, detail?: any) {
    super(type);
    this.detail = detail;
  }

  check(): EventType {
    return EventType.ERROR;
  }
}

export class WaitEvent extends Event {
  constructor() {
    super('notReady');
  }

  // shouldn't trigger the next block
  check(): EventType {
    return EventType.VOID;
  }
}
export class NoEmit extends Event {
  constructor() {
    super('noEmit');
  }

  // shouldn't trigger the next block
  check(): EventType {
    return EventType.VOID;
  }
}
export class CompleteEvent extends Event {
  constructor() {
    super('complete');
  }
}

export const WAIT = new WaitEvent();
export const NO_EMIT = new NoEmit();
