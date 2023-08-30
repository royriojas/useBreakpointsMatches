import React, { ReactNode } from 'react';

import { defaultBreakpoints, useBreakpointMatches } from './useBreakpointMatches';

export interface BreakpointsAwareProps<
  T extends Record<string, number> = typeof defaultBreakpoints,
> {
  breakpoints?: T;
  width?: number | string;
  className?: string;
  children: (args: { [P in keyof T]: boolean }) => React.ReactNode;
}

export function BreakpointsAware<T extends Record<string, number> = typeof defaultBreakpoints>(
  args: BreakpointsAwareProps<T>,
): ReactNode {
  const { className, children, width = '100%', ...rest } = args;
  const { breakpoints, ...extra } = rest;

  const { setRef, widthMap } = useBreakpointMatches({ breakpoints });

  return (
    <div ref={setRef} className={className} style={{ width }} {...extra}>
      {widthMap && children(widthMap)}
    </div>
  );
}
