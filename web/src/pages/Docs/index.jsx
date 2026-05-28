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

/*
Manual route verification target:
- Visit /docs
- Expect a public docs page, not NotFound
- Expect the page to render without login
*/

import React from 'react';
import { Card, Tag, Typography } from '@douyinfe/semi-ui';
import DocsHero from './components/DocsHero';
import DocsStepSection from './components/DocsStepSection';
import CodeBlockCard from './components/CodeBlockCard';
import ClientCardGrid from './components/ClientCardGrid';
import CapabilityStatusPanel from './components/CapabilityStatusPanel';
import FaqList from './components/FaqList';
import {
  capabilityGroups,
  capabilityNotes,
  clientCards,
  configSamples,
  docsMeta,
  faqItems,
  heroNavigation,
  prepareChecklist,
  quickFacts,
  resourceLinks,
  sectionIds,
  verifyChecklist,
} from './docsData';
import './docs.css';

const { Title, Text, Paragraph } = Typography;

const renderChecklist = (items = []) => (
  <ol className='docs-list'>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ol>
);

const Docs = () => {
  return (
    <div className='docs-page mt-[60px] px-4 py-10'>
      <div className='docs-page-shell mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8'>
        <DocsHero
          title={docsMeta.title}
          subtitle={docsMeta.subtitle}
          serverName={docsMeta.serverName}
          serverUrl={docsMeta.serverUrl}
          authHeader={docsMeta.authHeader}
          previewConfig={configSamples.preview}
          quickFacts={quickFacts}
          navigationItems={heroNavigation}
        />

        <DocsStepSection
          id={sectionIds.prepare}
          className='docs-anchor-section'
          badge='Step 1'
          title='准备连接信息'
          description='先准备好固定的服务地址和 Bearer Token，后续三个客户端都使用同一套核心信息。'
        >
          <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
            <CodeBlockCard
              title='完整示例预览'
              description='推荐先复制这份示例，再按客户端要求微调字段。'
              code={configSamples.preview}
              minHeight={240}
            />
            <Card className='docs-info-panel !rounded-2xl shadow-sm' bordered>
              <div className='flex flex-col gap-4'>
                <div>
                  <Title heading={6} className='!mb-2'>
                    核心信息
                  </Title>
                  <div className='docs-muted-code'>{docsMeta.serverUrl}</div>
                </div>
                <div>
                  <Text type='secondary' className='leading-6'>
                    Authorization header 需要携带 Bearer Token，格式如下：
                  </Text>
                  <div className='docs-muted-code mt-2'>{docsMeta.authHeader}</div>
                </div>
                <div>
                  <Tag color='blue' shape='circle'>
                    无需本地 Node 服务
                  </Tag>
                </div>
              </div>
            </Card>
          </div>
          {renderChecklist(prepareChecklist)}
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.clients}
          className='docs-anchor-section'
          badge='Step 2'
          title='选择客户端'
          description='根据你的工作流选择对应入口。三种方式都使用同一个 HTTP MCP 服务地址和 Bearer Token。'
        >
          <ClientCardGrid items={clientCards} />
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.claudeCode}
          className='docs-anchor-section'
          badge='Step 3'
          title='Claude Code 配置'
          description='在项目级 .mcp.json 中添加 matrix-mcp，适合终端开发和日常协作场景。'
        >
          <CodeBlockCard
            title='Claude Code / .mcp.json'
            description='将 YOUR_TOKEN 替换为你自己的 Bearer Token。'
            code={configSamples.claudeCode}
            minHeight={240}
          />
          <Paragraph className='!mb-0 leading-7 text-[var(--semi-color-text-1)]'>
            保存后重启 Claude Code，或触发 MCP 配置重新加载，即可在工具列表中看到 matrix-mcp。
          </Paragraph>
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.codex}
          className='docs-anchor-section'
          badge='Step 3'
          title='Codex 配置'
          description='Codex 同样使用 HTTP MCP 连接方式。只要支持 mcpServers 配置，就可以复用同样的服务信息。'
        >
          <CodeBlockCard
            title='Codex 配置示例'
            description='如果你的 Codex 环境支持项目级或用户级 MCP JSON，可直接使用这份结构。'
            code={configSamples.codex}
            minHeight={240}
          />
          <Paragraph className='!mb-0 leading-7 text-[var(--semi-color-text-1)]'>
            如果你的运行环境对配置文件路径有额外要求，只需要保留同样的 type、url 和 Authorization headers 即可。
          </Paragraph>
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.mcp}
          className='docs-anchor-section'
          badge='Step 3'
          title='通用 MCP 配置'
          description='适用于其他支持 HTTP MCP 的客户端或平台。只保留最基本的 name、type、url 和 headers 即可。'
        >
          <CodeBlockCard
            title='通用 HTTP MCP 配置'
            description='当客户端不使用 mcpServers 包装时，可改用单个服务对象格式。'
            code={configSamples.generic}
            minHeight={210}
          />
          <Paragraph className='!mb-0 leading-7 text-[var(--semi-color-text-1)]'>
            若客户端有独立的 UI 表单，按字段填入 URL 与 Authorization header，效果与 JSON 配置等价。
          </Paragraph>
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.verify}
          className='docs-anchor-section'
          badge='Step 4'
          title='验证并开始使用'
          description='完成配置后，先做一次快速验证，确保客户端已经成功发现并加载工具。'
        >
          <div className='grid gap-4 lg:grid-cols-[1fr_1fr]'>
            <Card className='docs-info-panel !rounded-2xl shadow-sm' bordered>
              <Title heading={6} className='!mb-3'>
                推荐验证方式
              </Title>
              {renderChecklist(verifyChecklist)}
            </Card>
            <Card className='docs-info-panel !rounded-2xl shadow-sm' bordered>
              <Title heading={6} className='!mb-3'>
                常见排查点
              </Title>
              <ul className='docs-list'>
                <li>确认 Token 没有遗漏 Bearer 前缀。</li>
                <li>确认客户端支持 HTTP MCP，而不是仅支持 stdio MCP。</li>
                <li>确认保存配置后已重启客户端或重新加载 MCP。</li>
                <li>确认网络可以访问 {docsMeta.serverUrl}。</li>
              </ul>
            </Card>
          </div>
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.capability}
          className='docs-anchor-section'
          badge='Capability'
          title='能力状态'
          description='下面的状态反映当前可用情况，便于你在接入后优先验证高价值能力。'
        >
          <CapabilityStatusPanel groups={capabilityGroups} notes={capabilityNotes} />
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.faq}
          className='docs-anchor-section'
          badge='FAQ'
          title='常见问题'
          description='如果接入后表现和预期不一致，先从这里快速排查。'
        >
          <FaqList items={faqItems} />
        </DocsStepSection>

        <DocsStepSection
          id={sectionIds.resources}
          className='docs-anchor-section'
          badge='Resources'
          title='更多资源'
          description='保留几个最常用的跳转入口，方便后续继续补充或分享给团队成员。'
        >
          <div className='docs-resource-grid md:grid-cols-2 xl:grid-cols-3'>
            {resourceLinks.map((item) => (
              <a
                key={item.title}
                className='docs-resource-link'
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <Title heading={6} className='!mb-0'>
                  {item.title}
                </Title>
                <Text type='secondary' className='leading-6'>
                  {item.description}
                </Text>
                <Text link>{item.label}</Text>
              </a>
            ))}
          </div>
        </DocsStepSection>
      </div>
    </div>
  );
};

export default Docs;
