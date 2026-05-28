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
import { Button, Card, Space, Toast, Typography } from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { copy } from '../../../helpers';

const { Text } = Typography;

const CodeBlockCard = ({ title, description, code, footer, minHeight = 0 }) => {
  const { t } = useTranslation();
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (!code || isCopying) {
      return;
    }

    setIsCopying(true);
    const success = await copy(code);
    if (success) {
      Toast.success(t('已复制到剪贴板'));
    } else {
      Toast.error(t('复制失败'));
    }
    setIsCopying(false);
  };

  return (
    <Card
      className='docs-code-card !rounded-2xl shadow-sm'
      bordered
      bodyStyle={{ padding: 0 }}
      title={
        <div className='flex flex-col gap-1 py-1'>
          <div className='flex items-center justify-between gap-3'>
            <span>{title}</span>
            <Button
              theme='borderless'
              type='tertiary'
              icon={<IconCopy />}
              loading={isCopying}
              onClick={handleCopy}
            >
              {t('复制')}
            </Button>
          </div>
          {description ? (
            <Text type='tertiary' size='small'>
              {description}
            </Text>
          ) : null}
        </div>
      }
      footer={footer ? <Space>{footer}</Space> : null}
    >
      <pre
        className='docs-code-block'
        style={{ minHeight }}
      >
        <code>{code}</code>
      </pre>
    </Card>
  );
};

export default CodeBlockCard;
