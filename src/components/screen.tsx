import type { ReactNode } from 'react';

import { Box } from '@/components/ui/box';
import { Navbar } from '@/components/navbar';
import { TAB_BAR_CONTENT_INSET } from '@/components/bottom-tab-bar';

export function Screen({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box className="flex-1">
      <Navbar title={title} />
      <Box className="flex-1 items-center justify-center" style={{ paddingBottom: TAB_BAR_CONTENT_INSET }}>
        {children}
      </Box>
    </Box>
  );
}
