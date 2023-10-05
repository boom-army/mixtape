export const handleNFTError = (error: unknown) => {
  if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error("An unknown error occurred");
  }
};