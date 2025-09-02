import { styled } from "styled-components";


export const ConnectCategoriesContainer = styled.div`
  padding: 0 24px;
  /* 移除内层滚动，让外层 ModalContent 统一处理滚动 */
  /* max-height: calc(90vh - 200px); */
  /* overflow-y: auto; */
`;

export const CategorySection = styled.div`
  margin-bottom: 12px;
`;

export const CategoryTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    margin-right: 6px;
    margin-bottom: -3px;
  }
`;

export const ConnectGrid = styled.div`
  display: grid;
  //宽度
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

export  const ConnectCard = styled.div`
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
`;

export const ConnectIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  background: rgba(255, 255, 255,0.65);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const ConnectInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ConnectName = styled.h5`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
`;

export const ConnectDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#ededed'};
  font-size: 14px;
`;

export const ErrorState = styled.div`
  padding: 20px 24px;
  margin: 0 24px 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.1)'
    : 'rgba(239, 68, 68, 0.05)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.3)'
    : 'rgba(239, 68, 68, 0.2)'
  };
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
`;