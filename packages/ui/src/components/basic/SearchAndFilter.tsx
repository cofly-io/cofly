import React from 'react';
import { SearchAndFilterProps } from '../../main/home/types';
import {
  SearchAndFilterContainer,
  SearchInput,
  FilterContainer,
  SortSelect,
} from '../../main/home/styles';

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <SearchAndFilterContainer>
      <SearchInput
        type="text"
        placeholder="🔍 Search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <FilterContainer>
        <SortSelect value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="last-updated">时间排序</option>
          <option value="name">名称排序</option>
        </SortSelect>
        <button style={{ background: 'none', border: 'none', padding: '8px' }}>
          🔽
        </button>
        <button style={{ background: 'none', border: 'none', padding: '8px' }}>
          📋
        </button>
      </FilterContainer>
    </SearchAndFilterContainer>
  );
}; 