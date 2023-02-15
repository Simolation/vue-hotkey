export const isElementAvailable = (excludedElements?: string[]): boolean => {
  return !excludedElements?.find(
    (el) => el === document.activeElement?.tagName.toLowerCase()
  );
};
