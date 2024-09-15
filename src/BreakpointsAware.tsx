import React, { useCallback } from 'react';
import { cnPerMatches } from './cn';

import { defaultBreakpoints, useBreakpointMatches } from './useBreakpointMatches';

export interface BreakpointsAwareProps<
  T extends Record<string, number> = typeof defaultBreakpoints,
> {
  breakpoints?: T;
  width?: number | string;
  className?: string;
  children: (childrenArgs: {
    matches: { [P in keyof T]?: boolean };
    cn: (args: { [P in keyof T]?: string }) => string;
  }) => React.ReactNode;
}

export function BreakpointsAware<T extends Record<string, number> = typeof defaultBreakpoints>(
  args: BreakpointsAwareProps<T>,
): JSX.Element {
  const { className, children, width = '100%', ...rest } = args;
  const { breakpoints, ...extra } = rest;

  const { setRef, widthMap } = useBreakpointMatches({ breakpoints });

  const cn = useCallback(
    (cnArgs: { [P in keyof T]?: string }): string => {
      return cnPerMatches(widthMap ?? {}, cnArgs);
    },
    [widthMap],
  );

  return (
    <div ref={setRef} className={className} style={{ width }} {...extra}>
      {widthMap && children({ matches: widthMap, cn })}
    </div>
  );
}
