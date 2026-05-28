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
import { Card, Tag, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const toneMap = {
  success: 'green',
  warning: 'orange',
  danger: 'red',
  primary: 'blue',
};

const CapabilityStatusPanel = ({ groups = [], notes = [] }) => {
  return (
    <Card className='!rounded-2xl shadow-sm' bordered>
      <div className='flex flex-col gap-5'>
        <div className='grid gap-4 lg:grid-cols-3'>
          {groups.map((group) => (
            <div
              key={group.key}
              className='docs-capability-card rounded-2xl border border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-4'
            >
              <div className='mb-3 flex items-center justify-between gap-3'>
                <h3 className='m-0 text-base font-semibold text-[var(--semi-color-text-0)]'>
                  {group.title}
                </h3>
                <Tag color={toneMap[group.tone] || toneMap.primary} shape='circle'>
                  {group.items?.length || 0}
                </Tag>
              </div>
              <div className='flex flex-wrap gap-2'>
                {group.items?.map((item) => (
                  <Tag key={item} color={toneMap[group.tone] || toneMap.primary}>
                    {item}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
        {notes.length > 0 ? (
          <div className='rounded-2xl border border-dashed border-[var(--semi-color-border)] p-4'>
            <div className='mb-2 font-medium text-[var(--semi-color-text-0)]'>说明</div>
            <div className='flex flex-col gap-2'>
              {notes.map((note) => (
                <Text key={note} type='secondary' className='leading-6'>
                  {note}
                </Text>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default CapabilityStatusPanel;
