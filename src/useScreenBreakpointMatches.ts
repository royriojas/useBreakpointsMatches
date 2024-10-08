import { useCallback, useEffect, useState } from 'react';
import { cnPerMatches } from './cn';
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

let vBreakpoints: ScreenDimension<typeof defaultBreakpoints>;
let hBreakpoints: ScreenDimension<typeof defaultBreakpoints>;

export const getHBreakpoints = () => hBreakpoints;
export const getVBreakpoints = () => vBreakpoints;

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

  hBreakpoints = new ScreenDimension<T>({});

  const keys = Object.keys(breakpoints);

  hBreakpoints.matches[keys[0] as keyof typeof hBreakpoints.matches] = true;

  for (let i = 1; i < keys.length; i += 1) {
    const key = keys[i - 1];
    const nextKey = keys[i];

    checkQuery(hBreakpoints, key, nextKey, 'min-width', breakpoints, { matches: i === 1 });
  }
};

export const useHorizontalBreakpoints = <T extends Record<string, number>>() => {
  if (!hBreakpoints) {
    throw new Error('initHorizontalBreakpoints must be called before useHorizontalBreakpoints');
  }

  const brk = hBreakpoints as ScreenDimension<T>;

  const [matches, updateMatches] = useState(brk?.matches);

  useEffect(() => {
    return hBreakpoints.subscribeToChanges(() => {
      updateMatches({ ...brk.matches });
    });
  }, [brk]);

  return matches;
};

export const initVerticalBreakpoints = <T extends Record<string, number>>(
  args?: BreakpointMatchesArgs<T>,
) => {
  const { breakpoints = defaultBreakpoints } = args || {};

  vBreakpoints = new ScreenDimension<T>({});

  const keys = Object.keys(breakpoints);
  for (let i = 1; i < keys.length; i += 1) {
    const key = keys[i - 1];
    const nextKey = keys[i];

    checkQuery(vBreakpoints, key, nextKey, 'min-height', breakpoints, { matches: i === 1 });
  }
};

export const useVerticalBreakpoints = <T extends Record<string, number>>() => {
  if (!vBreakpoints) {
    throw new Error('initVerticalBreakpoints must be called before useVerticalBreakpoints');
  }

  const brk = hBreakpoints as ScreenDimension<T>;

  const [matches, updateMatches] = useState(brk?.matches);

  useEffect(() => {
    return vBreakpoints.subscribeToChanges(() => {
      updateMatches({ ...brk.matches });
    });
  }, [brk]);

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
  initHorizontalBreakpoints({ breakpoints: args?.hBreakpoints });
  initVerticalBreakpoints({ breakpoints: args?.vBreakpoints });
};

export const useScreenBreakpoints = <
  T extends Record<string, number>,
  K extends Record<string, number>,
>() => {
  const hMatches = useHorizontalBreakpoints<T>();
  const vMatches = useVerticalBreakpoints<K>();

  const cnByMatchesH = useCallback(
    (args: { [P in keyof typeof hMatches]?: string }): string => {
      return cnPerMatches(hMatches ?? {}, args);
    },
    [hMatches],
  );

  const cnByMatchesV = useCallback(
    (args: { [P in keyof typeof vMatches]?: string }): string => {
      return cnPerMatches(vMatches ?? {}, args);
    },
    [vMatches],
  );

  return {
    hMatches,
    cnByMatchesH,
    cnByMatchesV,
    vMatches,
  };
};
