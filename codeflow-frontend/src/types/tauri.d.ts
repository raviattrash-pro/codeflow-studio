declare module '@tauri-apps/plugin-shell' {
  export interface SpawnOptions {
    cwd?: string;
    env?: Record<string, string>;
  }

  export interface ChildProcess {
    pid: number;
    kill(): Promise<void>;
  }

  export interface CommandEvent {
    code?: number;
    signal?: number;
  }

  export class Command {
    static sidecar(program: string, args?: string[] | string): Command;
    static create(program: string, args?: string[] | string): Command;
    spawn(): Promise<ChildProcess>;
    execute(): Promise<{ code: number; stdout: string; stderr: string }>;
    stdout: {
      on(event: 'data', callback: (line: string) => void): void;
    };
    stderr: {
      on(event: 'data', callback: (line: string) => void): void;
    };
    on(event: 'close', callback: (data: CommandEvent) => void): void;
    on(event: 'error', callback: (error: Error | string) => void): void;
  }
}

declare module '@tauri-apps/api' {
  export const invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
}

declare module '@tauri-apps/plugin-dialog' {
  export function open(options?: {
    directory?: boolean;
    multiple?: boolean;
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | string[] | null>;
}

declare module '@tauri-apps/plugin-fs' {
  export function readTextFile(filePath: string): Promise<string>;
  export function writeTextFile(filePath: string, contents: string): Promise<void>;
}

declare module '@tauri-apps/plugin-notification' {
  export function sendNotification(options: string | { title: string; body?: string }): void;
  export function isPermissionGranted(): Promise<boolean>;
  export function requestPermission(): Promise<string>;
}
