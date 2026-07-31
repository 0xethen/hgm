// /eda routes are ported from my own website (ethendotapp)
// they used to be strictly non-preloaded but now they are bc after hackgwinnett tweaks
// there really was no reason to have them be hydrated via javascript
// anyway, yeah. now this -route.tsx is useless

// although you should know that -(blah).tsx files in routes/ are not counted as routes
// so use those hyphens (-) if you want!!
// its pretty cool!

const superAdvancedCalculations = (): string => {
  // oxlint-disable-next-line no-constant-condition
  if (1 + 1 === 2) return "good job";
  return "bad job";
};

superAdvancedCalculations();
