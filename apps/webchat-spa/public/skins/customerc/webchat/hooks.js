let conversationCount = 0;

export function createStoreMiddleware() {
  return () => next => action => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      conversationCount += 1;
      console.info(`[Customer C] Conversation started #${conversationCount}`);
    }
    return next(action);
  };
}
