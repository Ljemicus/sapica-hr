'use client';

import { useState, useCallback } from 'react';

interface UseMicroInteractionOptions {
  scale?: number;
  rotate?: number;
}

export function useMicroInteraction(options: UseMicroInteractionOptions = {}) {
  const { scale = 0.98, rotate = 0 } = options;
  const [isActive, setIsActive] = useState(false);

  const handlers = {
    onMouseDown: useCallback(() => setIsActive(true), []),
    onMouseUp: useCallback(() => setIsActive(false), []),
    onMouseLeave: useCallback(() => setIsActive(false), []),
    onTouchStart: useCallback(() => setIsActive(true), []),
    onTouchEnd: useCallback(() => setIsActive(false), []),
  };

  const style = {
    transform: isActive 
      ? `scale(${scale})${rotate ? ` rotate(${rotate}deg)` : ''}` 
      : 'scale(1)',
    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return { handlers, style, isActive };
}

export function useHover() {
  const [isHovered, setIsHovered] = useState(false);

  const handlers = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
  };

  return { handlers, isHovered };
}

export function useFocus() {
  const [isFocused, setIsFocused] = useState(false);

  const handlers = {
    onFocus: useCallback(() => setIsFocused(true), []),
    onBlur: useCallback(() => setIsFocused(false), []),
  };

  return { handlers, isFocused };
}
