import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

export const defaultBreakpoints = {
  xss: 320,
  xs: 480,
  sm: 690,
  md: 850,
  lg: 1124,
  xl: 1380,
  xxl: 1920,
  xxl2: 2160,
};
export interface BreakpointMatchesArgs<
  T extends Record<string, number> = typeof defaultBreakpoints,
> {
  breakpoints?: T;
}

const genId = (() => {
  let id = 0;
  return () => {
    return id++; // eslint-disable-line no-plusplus
  };
})();

export const useBreakpointsMatches = <T extends Record<string, number>>(
  args?: BreakpointMatchesArgs<T>,
) => {
  const { breakpoints = defaultBreakpoints } = args || {};

  type WidthMap = {
    [P in keyof T]: boolean;
  };

  const [widthMap, setWidthMap] = React.useState<WidthMap | undefined>(undefined);

  const suffix = useMemo(() => genId(), []);

  const ids = useMemo(() => {
    return {
      cname: `c--${suffix}`,
      sentryContainer: `sc--${suffix}`,
      sentryItem: `si--${suffix}`,
      styleId: `was--${suffix}`,
      sentry: `s--${suffix}`,
    };
  }, [suffix]);

  const cName = ids.cname;

  useLayoutEffect(() => {
    const style = document.createElement('style');
    style.id = ids.styleId;

    const keys = Object.keys(breakpoints);
    const sizes = keys.map((key, index) => ({
      key,
      start: index === 0 ? 0 : breakpoints[keys[index - 1] as keyof typeof breakpoints],
      end: breakpoints[key as keyof typeof breakpoints],
    }));

    const { sentry } = ids;

    const containerQueries = sizes.map((size) => {
      return `
        @container ${cName} (min-width: ${size.start}px) {
          .${sentry} .${ids.sentryItem}[data-size-label="${size.key}"] {
            display: inline-block;
          }
        }
      `;
    });

    style.innerHTML = `
      .${sentry} {
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        pointer-events: none;
        position: absolute;
        overflow: hidden;
      }
      
      .${sentry} .${ids.sentryContainer} {
        container-name: ${cName};
        container-type: inline-size;
      }
      .${sentry} .${ids.sentryItem} {
        width: calc(100% / ${sizes.length});
        height: 1px;
        display: none;
      }
      
      .${sentry} .${ids.sentryItem} > * {
        visibility: hidden;
      }
      
      ${containerQueries.join('')}
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [breakpoints, ids, cName]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (el: HTMLElement | null) => {
      if (!el) {
        const { current: observer } = observerRef;
        if (observer) {
          (observer as IntersectionObserver).disconnect();
        }
      } else {
        const options = {
          root: el,
        };

        if (el) {
          el.style.position = 'relative';
        }

        const sentry = document.createElement('div');
        sentry.setAttribute('class', ids.sentry);

        sentry.innerHTML = `<div class="${ids.sentryContainer}">
          ${Object.keys(breakpoints).map((key) => {
            return `<div data-size-label="${key}" class="${ids.sentryItem}">
              <span>key</span>
            </div>`;
          })}
        </div>`;

        el.prepend(sentry);

        const obj: WidthMap = {} as WidthMap;

        const observer = new IntersectionObserver((changes) => {
          changes.forEach((change) => {
            const key = change.target.getAttribute('data-size-label');
            if (!key) return;
            obj[key as keyof WidthMap] = change.isIntersecting;
          });

          setWidthMap((original) => ({ ...original, ...obj }));
        }, options);

        const sentryItem = Array.from(el.querySelectorAll(`.${ids.sentryItem}`));

        sentryItem.forEach((item) => {
          observer.observe(item);
        });

        observerRef.current = observer;
      }
    },
    [ids.sentryItem, breakpoints, ids.sentry, ids.sentryContainer],
  );

  return useMemo(() => {
    return {
      setRef,
      widthMap,
    };
  }, [setRef, widthMap]);
};
