import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ChatArea from '../../../components/playground/ChatArea';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value) => value,
  }),
}));

vi.mock('../../../components/playground/CustomInputRender', () => ({
  default: () => <div data-testid='custom-input-render' />,
}));

vi.mock('@douyinfe/semi-ui', () => ({
  Card: ({ children }) => <div>{children}</div>,
  Chat: React.forwardRef(() => <div data-testid='semi-chat' />),
  Typography: {
    Title: ({ children }) => <div>{children}</div>,
    Text: ({ children }) => <div>{children}</div>,
  },
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

const defaultProps = {
  chatRef: React.createRef(),
  message: [],
  inputs: { model: 'gpt-4.1' },
  styleState: { isMobile: false },
  showDebugPanel: false,
  roleInfo: {},
  onMessageSend: vi.fn(),
  onMessageCopy: vi.fn(),
  onMessageReset: vi.fn(),
  onMessageDelete: vi.fn(),
  onStopGenerator: vi.fn(),
  onClearMessages: vi.fn(),
  onToggleDebugPanel: vi.fn(),
  renderCustomChatContent: vi.fn(),
  renderChatBoxAction: vi.fn(),
};

describe('ChatArea LobeHub entry', () => {
  it('hides the LobeHub button when no URL is configured', () => {
    render(<ChatArea {...defaultProps} />);

    expect(screen.queryByText('用 LobeHub 打开')).not.toBeInTheDocument();
  });

  it('shows the LobeHub button when a URL is configured', () => {
    render(
      <ChatArea
        {...defaultProps}
        lobehubChatUrl='https://lobehub.000328.xyz'
        onOpenLobeHub={vi.fn()}
      />,
    );

    expect(screen.getByText('用 LobeHub 打开')).toBeInTheDocument();
  });

  it('opens LobeHub without rendering a NewAPI token', () => {
    const onOpenLobeHub = vi.fn();

    render(
      <ChatArea
        {...defaultProps}
        lobehubChatUrl='https://lobehub.000328.xyz'
        onOpenLobeHub={onOpenLobeHub}
      />,
    );

    fireEvent.click(screen.getByText('用 LobeHub 打开'));

    expect(onOpenLobeHub).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain('sk-');
  });
});
