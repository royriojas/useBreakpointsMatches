import { useEffect, useState } from 'react';
import { createEmitter } from './emitter';
import { BreakpointMatchesArgs, defaultBreakpoints } from './useBreakpointMatches';

interface EmitterInterface<T> {
  onChange: (matches: {
    [P in keyof T]?: boolean;
  }) => void;
}

export class ScreenDimension<T> {
  matches: {
    [P in keyof T]?: boolean;
  };

  emitter = createEmitter<EmitterInterface<T>>();

  notifyChanges = () => {
    this.emitter.fire('onChange', this.matches);
  };

  subscribeToChanges = (handler: EmitterInterface<T>['onChange']) => {
    this.emitter.on('onChange', handler);

    return () => {
      this.emitter.off('onChange', handler);
    };
  };

  constructor(matches: {
    [P in keyof T]?: boolean;
  }) {
    this.matches = matches;
  }
}

let wBreakpoints: ScreenDimension<typeof defaultBreakpoints>;
let hBreakpoints: ScreenDimension<typeof defaultBreakpoints>;

const createMQ = (size: number, prop: string = 'min-width') => `(${prop}: ${size}px)`;

const checkQuery = <T extends Record<string, number>>(
  screenDim: ScreenDimension<T>,
  key: string,
  nextKey: string,
  prop: string = 'min-width',
  screenBreakpoints: T,
  defaultMatch: { matches: boolean } = { matches: false },
) => {
  const mq = createMQ(screenBreakpoints[key as keyof T], prop);

  // eslint-disable-next-line no-loop-func
  const listener = (e: MediaQueryListEvent | MediaQueryList) => {
    if (screenDim.matches[nextKey as keyof T] === e?.matches) return;
    screenDim.matches[nextKey as keyof T] = e?.matches;
    screenDim.notifyChanges();
  };

  if (typeof window === 'undefined') {
    listener(defaultMatch as MediaQueryListEvent | MediaQueryList);
    return;
  }

  const mqResult = window?.matchMedia?.(mq) || defaultMatch;

  if (mqResult.addEventListener) {
    mqResult.addEventListener('change', listener);
  } else {
    mqResult.addListener(listener);
  }

  listener(mqResult);
};

export const initHorizontalBreakpoints = <T extends Record<string, number>>(
  args?: BreakpointMatchesArgs<T>,
) => {
  const { breakpoints = defaultBreakpoints } = args || {};

  wBreakpoints = new ScreenDimension<T>({});

  const keys = Object.keys(breakpoints);
  for (let i = 1; i < keys.length; i += 1) {
    const key = keys[i - 1];
    const nextKey = keys[i];

    checkQuery(hBreakpoints, key, nextKey, 'min-width', breakpoints, { matches: i === 1 });
  }
};

export const useHorizontalBreakpoints = () => {
  if (!wBreakpoints) {
    throw new Error('initHorizontalBreakpoints must be called before useHorizontalBreakpoints');
  }

  const [matches, updateMatches] = useState(wBreakpoints?.matches);

  useEffect(() => {
    return hBreakpoints.subscribeToChanges(updateMatches);
  }, []);

  return matches;
};

export const initVerticalBreakpoints = <T extends Record<string, number>>(
  args?: BreakpointMatchesArgs<T>,
) => {
  const { breakpoints = defaultBreakpoints } = args || {};

  hBreakpoints = new ScreenDimension<T>({});

  const keys = Object.keys(breakpoints);
  for (let i = 1; i < keys.length; i += 1) {
    const key = keys[i - 1];
    const nextKey = keys[i];

    checkQuery(hBreakpoints, key, nextKey, 'min-height', breakpoints, { matches: i === 1 });
  }
};

export const useVerticalBreakpoints = () => {
  if (!hBreakpoints) {
    throw new Error('initVerticalBreakpoints must be called before useVerticalBreakpoints');
  }

  const [matches, updateMatches] = useState(hBreakpoints?.matches);

  useEffect(() => {
    return hBreakpoints.subscribeToChanges(updateMatches);
  }, []);

  return matches;
};

export interface ScreenBreakpoints<
  T extends Record<string, number> = typeof defaultBreakpoints,
  K extends Record<string, number> = typeof defaultBreakpoints,
> {
  hBreakpoints?: T;
  vBreakpoints?: K;
}

export const initScreenBreakpoints = <
  T extends Record<string, number>,
  K extends Record<string, number>,
>(
  args?: ScreenBreakpoints<T, K>,
) => {
  initHorizontalBreakpoints(args?.hBreakpoints);
  initVerticalBreakpoints(args?.vBreakpoints);
};

export const useScreenBreakpoints = () => {
  const hMatches = useHorizontalBreakpoints();
  const vMatches = useVerticalBreakpoints();

  return {
    hMatches,
    vMatches,
  };
};
