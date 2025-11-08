const WEBCHAT_SITE = 'https://<your-org>.github.io/greentic-webchat';
const TENANT = 'customera';
const WEBCHAT_SCRIPT = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js';

async function loadWebChat() {
  if (window.WebChat) {
    return window.WebChat;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WEBCHAT_SCRIPT;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.WebChat;
}

async function bootstrap() {
  const webchat = await loadWebChat();
  const skinResponse = await fetch(`${WEBCHAT_SITE}/skins/${TENANT}/skin.json`);
  const skin = await skinResponse.json();

  const [token, styleOptions, hostConfig] = await Promise.all([
    fetch(skin.directLine.tokenUrl).then((res) => res.json()).then((json) => json.token),
    fetch(`${WEBCHAT_SITE}${skin.webchat.styleOptions}`).then((res) => res.json()),
    fetch(`${WEBCHAT_SITE}${skin.webchat.adaptiveCardsHostConfig}`).then((res) => res.json())
  ]);

  const directLine = webchat.createDirectLine({ token });
  webchat.renderWebChat(
    {
      directLine,
      locale: skin.webchat.locale,
      styleOptions,
      adaptiveCardsHostConfig: hostConfig
    },
    document.getElementById('chat')
  );
}

bootstrap().catch((error) => {
  document.getElementById('chat').innerText = error.message;
});
