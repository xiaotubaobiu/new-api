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
import { Button, Card, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const ClientCardGrid = ({ items = [] }) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {items.map((item) => (
        <Card key={item.id} className='docs-client-card !rounded-2xl shadow-sm' bordered>
          <div className='flex h-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <h3 className='m-0 text-lg font-semibold text-[var(--semi-color-text-0)]'>
                {item.title}
              </h3>
              <Text type='secondary' className='leading-6'>
                {item.description}
              </Text>
            </div>
            <div className='mt-auto'>
              <Button
                theme='outline'
                type='primary'
                block
                htmlType='button'
                onClick={() => {
                  window.location.hash = item.id;
                }}
              >
                {item.action}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ClientCardGrid;
