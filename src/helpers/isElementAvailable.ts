export const isElementAvailable = (exludedElements?: string[]): boolean => {
  return !exludedElements?.find(
    (el) => el === document.activeElement?.tagName.toLowerCase()
  );
};
