import { ReactElement } from 'react';

export interface Category {
  id: string;
  name: string;
  // FIX: Specify that the icon component can receive className and style props. This resolves a TypeScript error in `App.tsx` when using `React.cloneElement`.
  icon: ReactElement<{ className?: string; style?: React.CSSProperties }>;
}

export interface Tool {
  id: number;
  icon: ReactElement;
  title: string;
  description: string;
  tags: string[];
  category: string;
}
