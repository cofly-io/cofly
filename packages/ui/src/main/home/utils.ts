export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'just now';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export const filterAndSortWorkflows = (
  workflows: any[],
  searchTerm: string,
  sortBy: string
) => {
  return workflows
    .filter(workflow => 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'last-updated') {
        return new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime();
      }
      return a.name.localeCompare(b.name);
    });
};

export const paginateItems = <T>(
  items: T[],
  currentPage: number,
  pageSize: number
): {
  paginatedItems: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
} => {
  const totalItems = items.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    paginatedItems,
    totalPages,
    startIndex,
    endIndex,
  };
}; 