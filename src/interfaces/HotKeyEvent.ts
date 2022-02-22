/**
 * HotKey Event
 */
export class HotkeyEvent extends Event {
  public srcKey?: string[];

  constructor(srcKey?: string[]) {
    super("hotkey", { bubbles: true });

    this.srcKey = srcKey;
  }
}
