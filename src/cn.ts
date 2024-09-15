export const cnPerMatches = <T extends Record<string, boolean>>(
  matches: T,
  classMap: Partial<Record<keyof T, string>>,
) => {
  const keys = Object.keys(matches) as (keyof T)[];

  let retVal: string | undefined = '';
  // eslint-disable-next-line no-plusplus
  for (let i = keys.length - 1; i >= 0; i--) {
    retVal = classMap[keys[i]];
    if (matches[keys[i]] && retVal) {
      break;
    }
    retVal = '';
  }
  return retVal || '';
};
