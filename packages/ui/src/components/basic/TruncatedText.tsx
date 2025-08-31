import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Truncated text container with line-clamp
const TruncatedContainer = styled.div<{ $maxLines: number }>`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.$maxLines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  cursor: help;
  position: relative;
  word-break: break-word;
`;

// Tooltip wrapper
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

// Tooltip content
const Tooltip = styled.div<{ $visible: boolean; $position: { x: number; y: number } }>`
  position: fixed;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  transform: translateX(-50%) translateY(-100%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: normal;
  max-width: 300px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
  
  /* Responsive behavior */
  @media (max-width: 768px) {
    max-width: 250px;
    font-size: 11px;
    padding: 6px 10px;
  }
  
  @media (max-width: 480px) {
    max-width: 200px;
    font-size: 10px;
    padding: 4px 8px;
    
    /* Ensure tooltip doesn't go off-screen on mobile */
    left: 50% !important;
    transform: translateX(-50%) translateY(-100%) !important;
  }
`;

interface TruncatedTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLines = 1,
  className,
  style,
  'aria-label': ariaLabel
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if text is actually truncated with performance optimization
  useEffect(() => {
    const checkTruncation = () => {
      if (containerRef.current) {
        try {
          const element = containerRef.current;
          const isOverflowing = element.scrollHeight > element.clientHeight;
          setIsTruncated(isOverflowing);
        } catch (error) {
          console.error('Truncation check error:', error);
          setIsTruncated(false);
        }
      }
    };

    // Debounce the truncation check for performance
    const debouncedCheck = (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(checkTruncation, 100);
      };
    })();

    checkTruncation();
    
    // Recheck on window resize with debouncing
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [text, maxLines]);

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (!isTruncated) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal position
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8; // 8px above the element
    
    // Ensure tooltip doesn't go off-screen horizontally
    const tooltipWidth = 300; // max-width from CSS
    const padding = 16;
    
    if (x - tooltipWidth / 2 < padding) {
      x = tooltipWidth / 2 + padding;
    } else if (x + tooltipWidth / 2 > viewportWidth - padding) {
      x = viewportWidth - tooltipWidth / 2 - padding;
    }
    
    // Ensure tooltip doesn't go off-screen vertically
    if (y < padding) {
      y = rect.bottom + 8; // Show below if not enough space above
    }

    setTooltipPosition({ x, y });
    setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  const handleFocus = (event: React.FocusEvent) => {
    if (!isTruncated) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal position (same logic as handleMouseEnter)
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8;
    
    // Ensure tooltip doesn't go off-screen horizontally
    const tooltipWidth = 300;
    const padding = 16;
    
    if (x - tooltipWidth / 2 < padding) {
      x = tooltipWidth / 2 + padding;
    } else if (x + tooltipWidth / 2 > viewportWidth - padding) {
      x = viewportWidth - tooltipWidth / 2 - padding;
    }
    
    // Ensure tooltip doesn't go off-screen vertically
    if (y < padding) {
      y = rect.bottom + 8;
    }

    setTooltipPosition({ x, y });
    setIsTooltipVisible(true);
  };

  return (
    <TooltipWrapper>
      <TruncatedContainer
        ref={containerRef}
        $maxLines={maxLines}
        className={className}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isTruncated ? text : undefined} // Fallback for accessibility
        aria-label={ariaLabel || (isTruncated ? `完整内容: ${text}` : undefined)}
        aria-expanded={isTooltipVisible}
        role={isTruncated ? "button" : undefined}
        tabIndex={isTruncated ? 0 : undefined}
        onKeyDown={isTruncated ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMouseEnter(e as any);
          }
          if (e.key === 'Escape') {
            handleMouseLeave();
          }
        } : undefined}
        onFocus={isTruncated ? handleFocus : undefined}
        onBlur={handleMouseLeave}
      >
        {text}
      </TruncatedContainer>
      
      {isTruncated && (
        <Tooltip
          $visible={isTooltipVisible}
          $position={tooltipPosition}
        >
          {text}
        </Tooltip>
      )}
    </TooltipWrapper>
  );
};

// Specialized component for connect descriptions
export const TruncatedDescription: React.FC<Omit<TruncatedTextProps, 'maxLines'>> = (props) => {
  return <TruncatedText {...props} maxLines={1} />;
};

// Hook for managing truncation state
export const useTruncation = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const showTooltip = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;

    setTooltipPosition({ x, y });
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
  };

  return {
    isTooltipVisible,
    tooltipPosition,
    showTooltip,
    hideTooltip,
  };
};