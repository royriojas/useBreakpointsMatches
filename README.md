# useBreakpointMatches

Small collection of utilties to make responsive designs simpler relying of a set of breakpoints.

This module uses `container queries` and `IntersectionObserver` to detect the changes in breakpoints in a given container and uses `MatchMedia` to detect screenBreakpoint changes

## installation

npm i use-breakpoint-matches

## Usage

There are 2 hooks here and a helper

1. One that track the screen breakpoints in the horizontal and vertical axis

```ts
import { initHorizontalBreakpoints } from 'use-breakpoint-matches';
// call this in your entrypoint file
initHorizontalBreakpoints({ 
  // optional, if not provided the exported defaultBreakpoints is going to be used
  // it defines the breakpoints that will be used across the app
  breakpoints: { 
    xs: 320, // from 0 to 320
    sm: 460, // from 321 to 460,
    md: 760, // from 461 to 760
    lg: 1024, // from 761 to 1024 
  }
});

// then on your app you can use the hook

import { useHorizontalBreakpoints } from 'use-breakpoint-matches';

const MyScreenAwareComponent = () => {
  const breakpoints = useHorizontalBreakpoints();

  // breakpoints will be an object that will contain all the breakpoints that matched the current width
  // in your component you can do something like

  if (breakpoints.md) {
    return <LayoutForMediumComponent />
  }

  // or pass it to a class helper similar to classnames or clsx
  
  return <div className={clsx(componentClass, breakpoints)}>{other code here}</div>
};

// then in your css you can do something like 

export const componentClass = style({
  // styles for all
  background: 'red',
  selectors: {
    '&.md': {
      background: 'yellow',
    },
  },
});
```

