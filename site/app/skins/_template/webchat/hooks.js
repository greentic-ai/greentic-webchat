export function createStoreMiddleware() {
  return () => next => action => {
    if (action.type === 'WEB_CHAT/SEND_EVENT') {
      console.info('[template hook] sending event', action);
    }
    return next(action);
  };
}

export function onBeforeRender(context) {
  console.info('[template hook] rendering tenant', context.skin.tenant);
}
