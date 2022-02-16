const unavailableElements = ["input", "textarea"];

export const isElementAvailable = (): boolean => {
  return !unavailableElements.find(
    (el) => el === document.activeElement?.tagName.toLowerCase()
  );
};
