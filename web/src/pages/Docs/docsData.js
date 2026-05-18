/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export const docsMeta = {
  title: 'Matrix MCP 快速接入',
  subtitle: '支持 Claude Code、Codex 和通用 HTTP MCP 客户端。复制配置即可连接。',
  serverName: 'matrix-mcp',
  serverUrl: 'https://matrix.000328.xyz:2053/mcp',
  authHeader: 'Authorization: Bearer <your_token>',
};

export const sectionIds = {
  prepare: 'prepare',
  clients: 'clients',
  claudeCode: 'claude-code',
  codex: 'codex',
  mcp: 'mcp',
  verify: 'verify',
  capability: 'capability-status',
  faq: 'faq',
  resources: 'more-resources',
};

export const quickFacts = [
  'Matrix MCP 是一个 HTTP MCP 服务。',
  '当前推荐方式是直接配置 URL 和 Bearer Token。',
  '不需要本地起 Node 服务。',
  '工具是否自动调用取决于客户端上下文判断。',
];

export const heroNavigation = [
  { id: sectionIds.prepare, label: '准备信息' },
  { id: sectionIds.clients, label: '选择客户端' },
  { id: sectionIds.verify, label: '验证使用' },
  { id: sectionIds.faq, label: '常见问题' },
];

export const prepareChecklist = [
  '准备可用的 Bearer Token，用于放入 Authorization 请求头。',
  '确认客户端支持 HTTP MCP，或者允许通过 JSON 配置 MCP 服务器。',
  '服务地址固定为 https://matrix.000328.xyz:2053/mcp。',
  '推荐先复制下面的完整示例，再按客户端格式做最小改动。',
];

export const clientCards = [
  {
    id: sectionIds.claudeCode,
    title: 'Claude Code',
    description: '项目级 .mcp.json 配置，适合日常终端开发工作流。',
    action: '查看配置',
  },
  {
    id: sectionIds.codex,
    title: 'Codex',
    description: '使用相同的 HTTP MCP 连接信息接入 Codex 工作流。',
    action: '查看配置',
  },
  {
    id: sectionIds.mcp,
    title: '通用 MCP',
    description: '适用于其他支持 HTTP MCP 的客户端。',
    action: '查看配置',
  },
];

export const configSamples = {
  preview: `{
  "mcpServers": {
    "matrix-mcp": {
      "type": "http",
      "url": "https://matrix.000328.xyz:2053/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}`,
  claudeCode: `{
  "mcpServers": {
    "matrix-mcp": {
      "type": "http",
      "url": "https://matrix.000328.xyz:2053/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}`,
  codex: `{
  "mcpServers": {
    "matrix-mcp": {
      "type": "http",
      "url": "https://matrix.000328.xyz:2053/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}`,
  generic: `{
  "name": "matrix-mcp",
  "type": "http",
  "url": "https://matrix.000328.xyz:2053/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  }
}`,
};

export const verifyChecklist = [
  '保存配置后重启客户端，确保 MCP 服务器重新加载。',
  '在客户端的 MCP 面板或工具列表中确认 matrix-mcp 已出现。',
  '先尝试一个简单请求，例如让客户端列出可用工具或调用图像/音频相关能力。',
  '如果没有生效，优先检查 URL、Token、Authorization header 是否拼写正确。',
];

export const capabilityGroups = [
  {
    key: 'available',
    title: '已验证可用',
    tone: 'success',
    items: ['图像生成', '图像理解', '音频理解'],
  },
  {
    key: 'unavailable',
    title: '当前不可用',
    tone: 'warning',
    items: ['网页搜索', '搜索后阅读'],
  },
  {
    key: 'unstable',
    title: '当前不稳定',
    tone: 'danger',
    items: ['视频理解'],
  },
];

export const capabilityNotes = [
  '网页搜索相关能力受上游 webSearchEnabled 配置影响。',
  '视频理解对部分公网 URL 可能因上游抓取失败而不可用。',
];

export const faqItems = [
  {
    question: '工具会自动调用吗？',
    answer: '会进入可用工具列表，但是否调用由客户端根据上下文决定，不保证每次都自动触发。',
  },
  {
    question: '为什么本地图片有时不走 MCP？',
    answer: '当客户端已有本地文件理解能力时，可能直接使用本地能力而不是远程 MCP。',
  },
  {
    question: '为什么网页搜索不能用？',
    answer: '当前上游未开启 web search 能力，因此相关工具暂不可用。',
  },
  {
    question: '为什么视频理解有时失败？',
    answer: '部分公网视频 URL 会因为上游抓取远程资源失败而报错。',
  },
  {
    question: '怎么在另一台电脑上使用？',
    answer: '复制相同的 HTTP MCP 配置，换成那台电脑要用的 Bearer Token 即可。',
  },
  {
    question: 'Token 应该放在哪里？',
    answer: '放在 MCP 配置的 Authorization header 中，并像密码一样妥善保管。',
  },
];

export const resourceLinks = [
  {
    title: '服务地址',
    description: '直接复制 HTTP MCP 接入地址，用于各类客户端配置。',
    href: 'https://matrix.000328.xyz:2053/mcp',
    label: '打开接入地址',
  },
  {
    title: 'Claude Code 配置样例',
    description: '优先参考项目级 .mcp.json 结构，快速完成 Claude Code 接入。',
    href: '#claude-code',
    label: '跳转到 Claude Code 配置',
  },
  {
    title: '通用 MCP 配置样例',
    description: '适用于其他支持 HTTP MCP 的客户端或平台。',
    href: '#mcp',
    label: '跳转到通用 MCP 配置',
  },
];
