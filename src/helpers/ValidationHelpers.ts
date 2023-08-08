export const isNullOrWhitespace = (input: any): boolean => {
  if (typeof input === 'undefined' || input == null) return true;

  return input.toString().replace(/\s/g, '').length < 1;
};

export const isUrl = (string: string) => {
  try {
    return !!new URL(string);
  } catch (e) {
    return false;
  }
};
