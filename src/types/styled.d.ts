import 'styled-components/native';
import { AppTheme } from '../presentation/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}