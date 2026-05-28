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

import React from 'react';
import { Card, Typography } from '@douyinfe/semi-ui';

const { Title, Text } = Typography;

const DocsStepSection = ({
  id,
  title,
  description,
  badge,
  extra,
  children,
  className = '',
}) => {
  return (
    <section id={id} className={className}>
      <Card className='!rounded-2xl shadow-sm' bordered>
        <div className='flex flex-col gap-5'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div className='flex flex-col gap-2'>
              {badge ? (
                <Text size='small' type='tertiary' className='uppercase tracking-[0.2em]'>
                  {badge}
                </Text>
              ) : null}
              <Title heading={4} className='!mb-0'>
                {title}
              </Title>
              {description ? (
                <Text type='secondary' className='leading-6'>
                  {description}
                </Text>
              ) : null}
            </div>
            {extra ? <div className='shrink-0'>{extra}</div> : null}
          </div>
          {children ? <div className='flex flex-col gap-4'>{children}</div> : null}
        </div>
      </Card>
    </section>
  );
};

export default DocsStepSection;
