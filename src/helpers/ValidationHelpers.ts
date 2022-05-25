export const isNullOrWhitespace = (input: any): Boolean => {
  if (typeof input === 'undefined' || input == null) return true;

  return input.toString().replace(/\s/g, '').length < 1;
};
