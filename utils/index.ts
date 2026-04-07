export const cleanUrl = (url: string): string => {
  if (!url) return "";
  // Remove backticks and extra spaces that might be present in the API response
  return url.replace(/[`\s]/g, "");
};
