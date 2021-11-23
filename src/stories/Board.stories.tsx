import React, { useContext } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Board, BoardContext } from '@/components';

export default {
  title: 'Example/Page',
  component: Board,
} as ComponentMeta<typeof Board>;

const Template: ComponentStory<typeof Board> = (args) => <Board {...args} />;

export const Default = Template.bind({});
Default.args = {
  Toolbar: () => {
    const ctx = useContext(BoardContext);

    return <>{ctx?.percent}</>;
  },
  mapNode: <div style={{ width: '5000px', minHeight: '5000px', backgroundColor: 'rgba(100, 0, 0, 0.2)' }}>Text</div>,
  fitOnCursorPositionWhenZoom: true,
  children: <div style={{ width: '5000px', minHeight: '5000px', backgroundColor: 'rgba(100, 0, 0, 0.2)' }}>Text</div>,
};
