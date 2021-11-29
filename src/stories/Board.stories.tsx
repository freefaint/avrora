import React, { useContext } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Board, BoardContext } from '@/components';

export default {
  title: 'Example/Page',
  component: Board,
} as ComponentMeta<typeof Board>;

const Template: ComponentStory<typeof Board> = (args) => <Board {...args} />;

const abs = (
  <div style={{ width: '8000px', display: 'flex', flexWrap: 'wrap' }}>
    {new Array(3200).fill(true).map((i) => (
      <div style={{ width: '200px', border: '1px solid #ccc', borderRadius: '10px', margin: '8px' }}>123</div>
    ))}
  </div>
);

export const Default = Template.bind({});
Default.args = {
  Toolbar: () => {
    const ctx = useContext(BoardContext);

    return <>{ctx?.percent}</>;
  },
  useScreenshotWhileMoving: true,
  // mapNode: abs,
  fitOnCursorPositionWhenZoom: true,
  children: abs,
};
