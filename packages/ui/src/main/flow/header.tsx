"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { enhancedGlassBase } from '../../components/shared/ui-components';
import { RiFileCopyLine, RiDownloadLine } from 'react-icons/ri';
import { MdOutlineShare } from "react-icons/md";
import { CoButton } from '../../components/basic/Buttons';
import { RiSaveLine } from "react-icons/ri";

const WorkflowHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  //align-items: center;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  padding: 5px 20px 5px;
  height: auto;
  /* 应用渐变背景效果 */
  background: ${({ theme }) => theme.mode === 'dark'
  ?'linear-gradient(201deg, #333f99, #0f1b3a)':'linear-gradient(201deg, #00A5B7, #1abd9f)'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(20, 207, 157, 0.2)'
  };
  
  ${enhancedGlassBase}
  border-radius: 0;
  margin-bottom: 0;
  position: relative;
  z-index: 100;  
`;

const WorkflowTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const WorkflowTitleInput = styled.input`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgb(212, 212, 212)' : 'rgba(30, 41, 59, 0.75)'};
  margin: 0;
  // margin-right: 10px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(28, 115, 245, 0.7)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  outline: none;
  padding: 4px 8px;
  border-radius: 2px;
  transition: all 0.3s ease;
  // min-width: 120px;
  max-width: 300px;
  width:290px;
  backdrop-filter: blur(4px);

  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 0 0 3px rgba(59, 130, 246, 0.2)'
    : '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };
  }

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
    border-color: rgba(59, 130, 246, 0.4);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  }
`;

const AddTagButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(11, 45, 124, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  backdrop-filter: blur(4px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(174, 206, 252, 0.75)' : 'rgba(100, 116, 139, 0.75)'};
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin-left: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: #3b82f6;
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'
  };
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.75)' : 'rgba(100, 116, 139, 0.75)'};
  font-size: 14px;
`;

const ShareButtonContainer = styled.div`
  position: relative;
  display: flex;
  z-index: 110;
`;

const ShareDropdownContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed !important;
  top: auto !important;
  right: auto !important;
  left: auto !important;
  bottom: auto !important;
  background: ${({ theme }) => theme.mode === 'dark'
    ? `
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.12) 0%, transparent 30%),
      radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 35%),
      radial-gradient(circle at 90% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 25%)
    `
    : `
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 30%),
      radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.05) 0%, transparent 35%),
      radial-gradient(circle at 90% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 25%)
    `
  };
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.3);
  z-index: 1500;
  border-radius: 8px;
  overflow: visible;
  margin-top: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)'
  };
`;

const ShareDropdownItem = styled.div`
  padding: 12px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  }
  
  svg {
    margin-left: 8px;
    font-size: 16px;
  }
`;

const ShareButton = styled.button`
    background: rgba(255, 255, 255, 0.08); 
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    height: 28px;
    padding: 0px 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    &:after {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    svg {
      margin-bottom:-1px;
      margin-right: 6px; 
    }
  /*background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  backdrop-filter: blur(4px);
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  border-radius: 8px;
  padding: 0 20px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }*/
`;

// const SaveButton = styled.button`
//   background: ${({ theme }) => theme.mode === 'dark'
//     ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4))'
//     : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.2))'
//   };
//   color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
//   border: 1px solid ${({ theme }) => theme.mode === 'dark'
//     ? 'rgba(59, 130, 246, 0.4)'
//     : 'rgba(59, 130, 246, 0.3)'
//   };
//   border-radius: 8px;
//   padding: 0 20px;
//   height: 32px;
//   font-size: 14px;
//   font-weight: 500;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
//   backdrop-filter: blur(4px);
//   position: relative;
//   overflow: hidden;
//   box-shadow: ${({ theme }) => theme.mode === 'dark'
//     ? '0 4px 12px rgba(59, 130, 246, 0.2)'
//     : '0 4px 12px rgba(59, 130, 246, 0.12)'
//   };

//   &::before {
//     content: "";
//     position: absolute;
//     top: 0;
//     left: -100%;
//     width: 100%;
//     height: 100%;
//     background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
//     transition: left 0.6s ease;
//   }

//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: ${({ theme }) => theme.mode === 'dark'
//       ? '0 6px 18px rgba(59, 130, 246, 0.3)'
//       : '0 6px 18px rgba(59, 130, 246, 0.18)'
//     };
//     border-color: rgba(59, 130, 246, 0.6);
//   }

//   &:hover::before {
//     left: 100%;
//   }
// `;

const MoreButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  backdrop-filter: blur(4px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'
  };
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
`;

interface WorkflowHeaderProps {
  workflowId: string;
  workflowName?: string;
  onWorkflowNameChange?: (name: string) => void;
  isActive?: boolean;
  onActiveChange?: (isActive: boolean) => void;
  onShare?: () => void;
  onSave?: () => void;
  onMoreOptions?: () => void;
  onAddTag?: () => void;
  onCopyToClipboard?: () => void;
  onExportJSON?: () => void;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowId,
  workflowName = "我的业务流",
  onWorkflowNameChange = () => { },
  isActive = false,
  onActiveChange = () => { },
  onShare = () => { },
  onSave = () => { },
  onMoreOptions = () => { },
  onAddTag = () => { },
  onCopyToClipboard = () => { },
  onExportJSON = () => { }
}) => {
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const toggleShareDropdown = () => {
    console.log('🎯 [ShareButton] 点击分享按钮，当前状态:', shareDropdownOpen);

    if (!shareDropdownOpen && shareButtonRef.current) {
      // 计算按钮位置
      const buttonRect = shareButtonRef.current.getBoundingClientRect();
      const newPosition = {
        top: buttonRect.bottom + window.scrollY + 4,
        left: buttonRect.right - 180 + window.scrollX // 180 是下拉框宽度，右对齐
      };
      setDropdownPosition(newPosition);
      console.log('📍 [ShareButton] 计算位置:', newPosition, '按钮位置:', buttonRect);
    }

    setShareDropdownOpen(!shareDropdownOpen);
    console.log('🎯 [ShareButton] 切换后状态:', !shareDropdownOpen);
  };

  const handleCopyToClipboard = () => {
    console.log('📋 [ShareButton] 点击复制到剪贴板');
    setShareDropdownOpen(false);
    onCopyToClipboard();
  };

  const handleExportJSON = () => {
    console.log('📁 [ShareButton] 点击导出JSON');
    setShareDropdownOpen(false);
    onExportJSON();
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShareDropdownOpen(false);
      }
    };

    if (shareDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [shareDropdownOpen]);


  return (
    <WorkflowHeaderContainer>
      <WorkflowTitleContainer>
        <WorkflowTitleInput
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          placeholder="我的业务流"
        />
        {/* <AddTagButton onClick={onAddTag}>+ Add tag</AddTagButton> */}
      </WorkflowTitleContainer>

      <ActionsContainer>
        <StatusToggle>
          状态：{isActive ? '活跃' : '暂停'}
        </StatusToggle>

        <ShareButtonContainer ref={shareDropdownRef}>
          <ShareButton ref={shareButtonRef} onClick={toggleShareDropdown}>
            <MdOutlineShare />分享
          </ShareButton>
          <ShareDropdownContent
            $isOpen={shareDropdownOpen}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <ShareDropdownItem onClick={handleCopyToClipboard}>
              复制到剪贴板 <RiFileCopyLine />
            </ShareDropdownItem>
            <ShareDropdownItem onClick={handleExportJSON}>
              导出文件（JSON） <RiDownloadLine />
            </ShareDropdownItem>
          </ShareDropdownContent>
        </ShareButtonContainer>

        <CoButton variant='Glass' onClick={onSave} backgroundColor='#0b62f0'><RiSaveLine size={15}/>保存</CoButton>
        {/* <SaveButton onClick={onSave}>
         </SaveButton> */}

        <MoreButton onClick={onMoreOptions}>
          ⋮
        </MoreButton>
      </ActionsContainer>
    </WorkflowHeaderContainer>
  );
};
