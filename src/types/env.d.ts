declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }
  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;

declare const __DEV__: boolean;
