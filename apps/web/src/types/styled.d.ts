import 'styled-components';
import { Theme } from '@repo/ui/main';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
} 