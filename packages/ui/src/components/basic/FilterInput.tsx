import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { LuSearch } from 'react-icons/lu';

// Filter container
const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto; /* Push to right side */
  position: relative;
`;

// Filter input wrapper
const FilterInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Filter input
const FilterInputField = styled.input`
  width: 200px;
  height: 28px;
  padding: 0 12px 0 36px; /* Space for search icon */
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.15);height: 28px;
  }
  
  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
  }
  
  /* Responsive behavior */
  @media (max-width: 768px) {
    width: 150px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    width: 120px;
    padding: 0 8px 0 28px;
  }
`;

// Search icon
const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
`;

// Clear button
const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0;
  transition: all 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }
  
  ${FilterInputField}:not(:placeholder-shown) + & {
    opacity: 1;
  }
`;

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  value,
  onChange,
  placeholder = "搜索连接...",
  className,
  debounceMs = 300,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounced onChange with error handling
  const debouncedOnChange = useCallback(
    debounceMs > 0 
      ? (() => {
          let timeoutId: NodeJS.Timeout;
          return (newValue: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              try {
                onChange(newValue);
              } catch (error) {
                console.error('Filter onChange error:', error);
              }
            }, debounceMs);
          };
        })()
      : (newValue: string) => {
          try {
            onChange(newValue);
          } catch (error) {
            console.error('Filter onChange error:', error);
          }
        },
    [onChange, debounceMs]
  );

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <FilterContainer className={className}>
      <FilterInputWrapper>
        <SearchIcon>
          <LuSearch />
        </SearchIcon>
        <FilterInputField
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel || "过滤连接"}
          aria-describedby={ariaDescribedBy}
          role="searchbox"
          autoComplete="off"
        />
        {localValue && (
          <ClearButton
            type="button"
            onClick={handleClear}
            aria-label="清除搜索"
            title="清除搜索 (Esc)"
          >
            ✕
          </ClearButton>
        )}
      </FilterInputWrapper>
    </FilterContainer>
  );
};

// Enhanced TabNav with filter support
const TabNavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 16px;
  
  /* Responsive behavior */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 8px;
  }
`;

const TabButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
  
  /* Responsive behavior */
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

interface TabNavProps {
  children: React.ReactNode;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  showFilter?: boolean;
  filterPlaceholder?: string;
  className?: string;
  'aria-label'?: string;
}

export const TabNav: React.FC<TabNavProps> = ({
  children,
  filterValue = '',
  onFilterChange,
  showFilter = true,
  filterPlaceholder,
  className,
  'aria-label': ariaLabel
}) => {
  return (
    <TabNavContainer 
      className={className}
      role="tablist"
      aria-label={ariaLabel || "连接分类导航"}
    >
      <TabButtonsContainer>
        {children}
      </TabButtonsContainer>
      {showFilter && onFilterChange && (
        <FilterInput
          value={filterValue}
          onChange={onFilterChange}
          placeholder={filterPlaceholder}
          aria-describedby="filter-help"
        />
      )}
    </TabNavContainer>
  );
};

// Hook for managing filter state with performance optimizations
export const useFilter = <T,>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Debounce the query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setError(null); // Clear error when query changes
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  // Filter items based on debounced query with error handling and performance optimization
  const filteredItems = React.useMemo(() => {
    try {
      if (!debouncedQuery.trim()) {
        return items;
      }
      
      // Performance optimization: limit processing for very large datasets
      if (items.length > 1000) {
        console.warn('Large dataset detected, consider implementing virtual scrolling');
      }
      
      const normalizedQuery = debouncedQuery.toLowerCase();
      return items.filter(item => {
        try {
          return filterFn(item, normalizedQuery);
        } catch (filterError) {
          console.error('Filter function error:', filterError);
          return false; // Exclude items that cause filter errors
        }
      });
    } catch (error) {
      console.error('Filter processing error:', error);
      setError('搜索时发生错误，请重试');
      return items; // Return original items on error
    }
  }, [items, debouncedQuery, filterFn]);

  // Memoized setter to prevent unnecessary re-renders
  const setQueryMemoized = React.useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    setQuery: setQueryMemoized,
    debouncedQuery,
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
    isFiltering: debouncedQuery.trim().length > 0,
    error
  };
};