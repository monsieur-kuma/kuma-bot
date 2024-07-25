// Emitted when the client encounters an error.
export const handler = (error: Error) => {
  Logger.error(`${error.name}: ${error.message}`);
};
