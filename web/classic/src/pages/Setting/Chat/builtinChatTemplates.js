export const BUILTIN_CHAT_TEMPLATES = [
  { name: 'Cherry Studio', url: 'cherrystudio://providers/api-keys?v=1&data={cherryConfig}' },
  { name: 'AionUI', url: 'aionui://provider/add?v=1&data={aionuiConfig}' },
  { name: '流畅阅读', url: 'fluentread' },
  { name: 'CC Switch', url: 'ccswitch' },
  {
    name: 'Lobe Chat',
    url: 'http://127.0.0.1:3210/?settings={"keyVaults":{"openai":{"apiKey":"{key}","baseURL":"{address}/v1"}}}',
  },
  {
    name: 'AI as Workspace',
    url: 'https://aiaw.app/set-provider?provider={"type":"openai","settings":{"apiKey":"{key}","baseURL":"{address}/v1","compatibility":"strict"}}',
  },
  { name: 'AMA 问天', url: 'ama://set-api-key?server={address}&key={key}' },
  { name: 'OpenCat', url: 'opencat://team/join?domain={address}&token={key}' },
];
