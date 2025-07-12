import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KappiAvatar } from '../../widgets/Chatbot/KappiAvatar';

describe('KappiAvatar', () => {
  it('should render with default props', () => {
    render(<KappiAvatar />);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'Kappi Avatar');
    expect(avatar).toHaveAttribute('src', 'https://cdn.jsdelivr.net/gh/BenjaminGhiggo/capibara-cdn@main/assets/capybara.svg');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<KappiAvatar size="sm" />);
    
    let avatarContainer = screen.getByRole('img').parentElement;
    expect(avatarContainer).toHaveClass('w-10', 'h-10');
    
    rerender(<KappiAvatar size="md" />);
    avatarContainer = screen.getByRole('img').parentElement;
    expect(avatarContainer).toHaveClass('w-12', 'h-12');
    
    rerender(<KappiAvatar size="lg" />);
    avatarContainer = screen.getByRole('img').parentElement;
    expect(avatarContainer).toHaveClass('w-16', 'h-16');
  });

  it('should render image with correct size classes', () => {
    const { rerender } = render(<KappiAvatar size="sm" />);
    
    let image = screen.getByRole('img');
    expect(image).toHaveClass('w-5', 'h-5');
    
    rerender(<KappiAvatar size="md" />);
    image = screen.getByRole('img');
    expect(image).toHaveClass('w-6', 'h-6');
    
    rerender(<KappiAvatar size="lg" />);
    image = screen.getByRole('img');
    expect(image).toHaveClass('w-8', 'h-8');
  });

  it('should handle click events when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<KappiAvatar onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render as button when onClick is not provided', () => {
    render(<KappiAvatar />);
    
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should show hat by default', () => {
    render(<KappiAvatar />);
    
    const avatar = screen.getByRole('img').parentElement;
    const hat = avatar?.querySelector('.absolute.-top-1.-right-1');
    expect(hat).toBeInTheDocument();
  });

  it('should hide hat when showHat is false', () => {
    render(<KappiAvatar showHat={false} />);
    
    const avatar = screen.getByRole('img').parentElement;
    const hat = avatar?.querySelector('.absolute.-top-1.-right-1');
    expect(hat).not.toBeInTheDocument();
  });

  it('should show scarf element', () => {
    render(<KappiAvatar />);
    
    const avatar = screen.getByRole('img').parentElement;
    const scarf = avatar?.querySelector('.absolute.bottom-0.left-1\\/2');
    expect(scarf).toBeInTheDocument();
  });

  it('should apply active styles when isActive is true', () => {
    render(<KappiAvatar isActive={true} />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('ring-2', 'ring-orange-300', 'bg-orange-200');
  });

  it('should not apply active styles when isActive is false', () => {
    render(<KappiAvatar isActive={false} />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).not.toHaveClass('ring-2', 'ring-orange-300', 'bg-orange-200');
  });

  it('should apply hover styles when clickable', () => {
    const handleClick = vi.fn();
    render(<KappiAvatar onClick={handleClick} />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('cursor-pointer', 'hover:scale-105', 'hover:bg-orange-200');
  });

  it('should show thinking animation for thinking expression', () => {
    render(<KappiAvatar expression="thinking" />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('animate-bounce-soft');
    
    // Should show thinking dots
    const thinkingDots = avatar?.querySelector('.absolute.-top-2.-right-2');
    expect(thinkingDots).toBeInTheDocument();
  });

  it('should show pulse animation for talking expression', () => {
    render(<KappiAvatar expression="talking" />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('animate-pulse');
    
    // Should show talking indicator
    const talkingIndicator = avatar?.querySelector('.absolute.-bottom-1.-right-1');
    expect(talkingIndicator).toBeInTheDocument();
  });

  it('should show opacity for sleeping expression', () => {
    render(<KappiAvatar expression="sleeping" />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('opacity-75');
  });

  it('should apply custom className', () => {
    render(<KappiAvatar className="custom-class" />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).toHaveClass('custom-class');
  });

  it('should maintain default happy expression when no expression is provided', () => {
    render(<KappiAvatar />);
    
    const avatar = screen.getByRole('img').parentElement;
    expect(avatar).not.toHaveClass('animate-bounce-soft', 'animate-pulse', 'opacity-75');
  });

  it('should have proper accessibility attributes', () => {
    const handleClick = vi.fn();
    render(<KappiAvatar onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-orange-300');
  });
});