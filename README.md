# useBreakpointMatches

Small collection of utilties to make responsive designs simpler relying of a set of breakpoints.

This module uses `container queries` and `IntersectionObserver` to detect the changes in breakpoints in a given container and uses `MatchMedia` to detect screenBreakpoint changes

## installation

npm i use-breakpoint-matches

## Usage

### BreakpointsAware

The `BreakpointsAware` component is a wrapper around the `useBreakpointMatches` hook.

```tsx
import { BreakpointsAware } from 'use-breakpoint-matches';

// The BreakpointsAware component receives a `breakpoints` prop that is an object with the breakpoints to be used in the component.
// for example { xs: 320, sm: 480, md: 768, lg: 1024 }
// this means we will have 4 breakpoints: xs, sm, md, lg
// xs starts at 0 (this will always be true, as at the very least the width of the container will be 0)
// sm starts at 320
// md starts at 480
// lg starts at 1024
// 
// the main idea is that if the container width is 485px, the matches object will be 
// { 
//   xs: true,
//   sm: true,
//   md: true,
//   lg: false
// }

<BreakpointsAware breakpoints={{ xs: 320, sm: 480, md: 768, lg: 1024 }}>
  {({ matches, cn }) => (
    <>
      <div className={cn({ xs: 'px-2 py-1', sm: 'px-4 py-2', md: 'px-6 py-3', lg: 'px-8 py-4' })}>
        The content here will have different classes as the breakpoints matche
      </div>
      <div>
        /* The content here will be displayed only when the breakpoints matches */
        {matches.xs && <div>xs</div>}
        {matches.sm && <div>sm</div>}
        {matches.md && <div>md</div>}
        {matches.lg && <div>lg</div>}
      </div>
    </>
  )}
</BreakpointsAware>;
```

`BreakpointsAware` receives a `breakpoints` prop that is an object with the breakpoints to be used in the component.

It also receives a `children` prop that is a function that receives an object with the current breakpoints matches and a function to generate a className based on the current breakpoints matches. 

The `cn` helper function is curried with the current breakpoints that match and return the className for the last breakpoint that matches.
So if the current breakpoints matches are `{ xs: true, sm: true, md: true, lg: false }` the `cn` function will return the className for the `md` breakpoint only.

### BreakpointsAware props

| Prop name | Type | Default | Description |
| --- | --- | --- | --- |
| breakpoints | `Record<string, number>` | `{ xss: 320, xs: 480, sm: 690, md: 850, lg: 1124, xl: 1380, xxl: 1920, xxl2: 2160 }` | The breakpoints to be used in the component. |
| width | `number` or `string` | `100%` | The width of the container to be used in the `BreakpointsAware` component. |
| className | `string` | `''` | The className to be used in the `BreakpointsAware` component. |
| children | `(args: { matches: { [P in keyof T]?: boolean }, cn: (args: { [P in keyof T]?: string }) => string }) => React.ReactNode` | `undefined` | The children function to be used in the `BreakpointsAware` component. |

### useBreakpointMatches

The main export from this module is the `useBreakpointMatches` hook.

```tsx
import { useBreakpointMatches } from 'use-breakpoint-matches';

const { setRef, widthMap } = useBreakpointMatches({ breakpoints });
```

`useBreakpointMatches` returns an object with two properties:

- `setRef`: a function that receives a `HTMLElement` and sets the `ref` of the container to be used in the `BreakpointsAware` component.
- `widthMap`: an object with the current breakpoints matches.

This is a low level hook that is not meant to be used directly. It is meant to be used in the `BreakpointsAware` component.

### useScreenBreakpointMatches

This is a higher level hook that uses `useBreakpointMatches` and `useHorizontalBreakpoints` to detect the screen breakpoints.

```tsx
import { useScreenBreakpoints } from 'use-breakpoint-matches';

const { hMatches, vMatches } = useScreenBreakpoints();
```

`useScreenBreakpointMatches` returns an object with four properties:

- `hMatches`: an object with the current horizontal breakpoints matches.
- `vMatches`: an object with the current vertical breakpoints matches.
- `cnByMatchesH`: a function that receives an object with the current horizontal breakpoints matches and returns the className for the last breakpoint that matches.
- `cnByMatchesV`: a function that receives an object with the current vertical breakpoints matches and returns the className for the last breakpoint that matches.

In order to use this hook you need to call `initScreenBreakpoints` before using it.

```tsx
import { initScreenBreakpoints } from 'use-breakpoint-matches';

// Do this before rendering your app
initScreenBreakpoints({ hBreakpoints: { xs: 320, sm: 480, md: 768, lg: 1024 }, vBreakpoints: { xs: 320, sm: 480, md: 768, lg: 1024 } });

// Then you can use it
const { hMatches, vMatches, cnByMatchesH, cnByMatchesV } = useScreenBreakpoints();

// Example usage for horizontal breakpoints
<div className={cnByMatchesH({ xs: 'px-2 py-1', sm: 'px-4 py-2', md: 'px-6 py-3', lg: 'px-8 py-4' })}>
  The content here will have different classes as the breakpoints matche
</div>
<div>
  /* The content here will be displayed only when the breakpoints matches */
  {hMatches.xs && <div>xs</div>}
  {hMatches.sm && <div>sm</div>}
  {hMatches.md && <div>md</div>}
  {hMatches.lg && <div>lg</div>}
</div>

```
## License

MIT