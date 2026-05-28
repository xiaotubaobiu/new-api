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
import { Collapse } from '@douyinfe/semi-ui';
import { IconMinus, IconPlus } from '@douyinfe/semi-icons';

const FaqList = ({ items = [] }) => {
  return (
    <Collapse accordion expandIcon={<IconPlus />} collapseIcon={<IconMinus />}>
      {items.map((item) => (
        <Collapse.Panel
          key={item.question}
          itemKey={item.question}
          header={item.question}
        >
          <div className='leading-7 text-[var(--semi-color-text-1)]'>
            {item.answer}
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  );
};

export default FaqList;
