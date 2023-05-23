import { mergeConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default mergeConfig(defaultConfig, {
  test: {
    include: ['**/*.(e2e|int)-spec.ts'],
    threads: false,
    globalSetup: ['./test/global-setup.ts'],
    testTimeout: 60000,
  },
});
