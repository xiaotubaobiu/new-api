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

import React, { useState } from 'react';
import { Button, Card, Space, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { IconChevronRightStroked, IconCopy, IconLink } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { copy } from '../../../helpers';

const { Title, Text } = Typography;

const DocsHero = ({
  title,
  subtitle,
  serverName,
  serverUrl,
  authHeader,
  previewConfig,
  quickFacts = [],
  navigationItems = [],
}) => {
  const { t } = useTranslation();
  const [copyingTarget, setCopyingTarget] = useState('');

  const handleCopy = async (value, target) => {
    if (!value || copyingTarget) {
      return;
    }

    setCopyingTarget(target);
    const success = await copy(value);
    if (success) {
      Toast.success(t('已复制到剪贴板'));
    } else {
      Toast.error(t('复制失败'));
    }
    setCopyingTarget('');
  };

  const handleNavigate = (id) => {
    if (!id) {
      return;
    }

    window.location.hash = id;
  };

  return (
    <Card className='docs-hero !rounded-3xl shadow-sm' bordered>
      <div className='flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex max-w-3xl flex-col gap-5'>
          <Space wrap>
            <Tag color='blue' size='large' shape='circle'>
              HTTP MCP
            </Tag>
            <Tag color='green' size='large' shape='circle'>
              {serverName}
            </Tag>
          </Space>
          <div className='flex flex-col gap-3'>
            <Title heading={2} className='!mb-0'>
              {title}
            </Title>
            <Text className='docs-hero-subtitle'>
              {subtitle}
            </Text>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='docs-hero-meta-card'>
              <Text type='tertiary' size='small'>
                服务地址
              </Text>
              <div className='docs-hero-meta-value'>
                {serverUrl}
              </div>
              <Button
                theme='light'
                type='primary'
                icon={<IconLink />}
                loading={copyingTarget === 'url'}
                onClick={() => handleCopy(serverUrl, 'url')}
              >
                {t('复制地址')}
              </Button>
            </div>
            <div className='docs-hero-meta-card'>
              <Text type='tertiary' size='small'>
                鉴权头
              </Text>
              <div className='docs-hero-meta-value'>
                {authHeader}
              </div>
              <Button
                theme='light'
                type='primary'
                icon={<IconCopy />}
                loading={copyingTarget === 'header'}
                onClick={() => handleCopy(authHeader, 'header')}
              >
                {t('复制鉴权头')}
              </Button>
            </div>
          </div>

          <div className='docs-hero-cta-group'>
            <Button
              theme='solid'
              type='primary'
              size='large'
              icon={<IconCopy />}
              loading={copyingTarget === 'preview'}
              onClick={() => handleCopy(previewConfig, 'preview')}
            >
              {t('复制完整示例')}
            </Button>
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                theme='outline'
                type='primary'
                size='large'
                icon={<IconChevronRightStroked />}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className='docs-hero-aside'>
          <Text type='tertiary' size='small'>
            快速说明
          </Text>
          <div className='mt-4 flex flex-col gap-3'>
            {quickFacts.map((fact, index) => (
              <div key={fact} className='docs-hero-fact'>
                <span className='docs-hero-fact-index'>{index + 1}</span>
                <Text className='leading-6'>{fact}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocsHero;
