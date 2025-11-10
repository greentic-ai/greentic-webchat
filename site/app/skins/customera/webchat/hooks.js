export function createStoreMiddleware() {
  return () => next => action => {
    if (action.type === 'WEB_CHAT/SET_CARD_ACTION') {
      console.debug('[Customer A] card action intercepted', action.payload);
    }
    return next(action);
  };
}

export function onBeforeRender(context) {
  document.body.dataset.customer = context.skin.tenant;
}
