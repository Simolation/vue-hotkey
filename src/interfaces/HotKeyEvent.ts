/**
 * HotKey Event
 */
export class HotKeyEvent extends Event {
  public srcKey?: string[];

  constructor(srcKey?: string[]) {
    super("hotkey", { bubbles: true });

    this.srcKey = srcKey;
  }
}
