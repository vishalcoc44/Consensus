// Mock encryption utility
// This file will be replaced with a real implementation later

export const encrypt = (data: string): string => {
  // In a real implementation, this would encrypt the data
  return `encrypted_${data}`;
};

export const decrypt = (encryptedData: string): string => {
  // In a real implementation, this would decrypt the data
  if (encryptedData.startsWith('encrypted_')) {
    return encryptedData.substring(10);
  }
  return encryptedData;
};
