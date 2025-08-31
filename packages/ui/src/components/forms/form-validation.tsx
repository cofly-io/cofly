"use client";

import React, { useEffect } from 'react';

// Custom validation messages in Chinese
const validationMessages = {
  valueMissing: '请填写此内容',
  typeMismatch: {
    email: '请输入有效的电子邮件地址'
  },
  patternMismatch: '请按照要求的格式填写',
  tooShort: '输入的内容长度不够',
  tooLong: '输入的内容长度太长',
  rangeUnderflow: '输入的值太小',
  rangeOverflow: '输入的值太大',
  stepMismatch: '请输入有效的值',
  badInput: '请输入一个数字'
};

// Initialize form validation with Chinese messages
export const initializeFormValidation = () => {
  useEffect(() => {
    // Override the default validation messages for all inputs
    const setCustomValidationMessages = () => {
      // Get all form elements
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        // Get all input elements in the form
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
          // 添加一个标记用户交互的事件
          input.addEventListener('blur', () => {
            input.classList.add('touched');
          });

          // Override the validation message when the input is invalid
          input.addEventListener('invalid', (e) => {
            const target = e.target as HTMLInputElement;
            e.preventDefault();

            // 添加touched类，表示此输入框已经被验证过
            target.classList.add('touched');

            // Determine the validation message based on the validation state
            let message = '';

            if (target.validity.valueMissing) {
              message = validationMessages.valueMissing;
            } else if (target.validity.typeMismatch) {
              if (target.type === 'email') {
                message = validationMessages.typeMismatch.email;
              } else {
                message = validationMessages.patternMismatch;
              }
            } else if (target.validity.tooShort) {
              message = validationMessages.tooShort;
            } else if (target.validity.tooLong) {
              message = validationMessages.tooLong;
            } else if (target.validity.rangeUnderflow) {
              message = validationMessages.rangeUnderflow;
            } else if (target.validity.rangeOverflow) {
              message = validationMessages.rangeOverflow;
            } else if (target.validity.stepMismatch) {
              message = validationMessages.stepMismatch;
            } else if (target.validity.badInput) {
              message = validationMessages.badInput;
            } else if (target.validity.patternMismatch) {
              message = validationMessages.patternMismatch;
            }

            // Set the custom validation message
            target.setCustomValidity(message);

            // Add error class to the input
            target.classList.add('error');

            // 创建或更新错误消息元素作为工具提示
            let errorElement = target.parentElement?.querySelector('.validation-tooltip') as HTMLElement | null;
            if (!errorElement) {
              errorElement = document.createElement('div');
              errorElement.className = 'validation-tooltip';

              // Style the tooltip
              // 将errorElement类型断言为HTMLElement
              const htmlErrorElement = errorElement as HTMLElement;
              htmlErrorElement.style.position = 'absolute';
              htmlErrorElement.style.backgroundColor = '#e53935';
              htmlErrorElement.style.color = 'white';
              htmlErrorElement.style.padding = '5px 10px';
              htmlErrorElement.style.borderRadius = '4px';
              htmlErrorElement.style.fontSize = '12px';
              htmlErrorElement.style.zIndex = '1000';
              htmlErrorElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
              htmlErrorElement.style.marginTop = '5px';
              htmlErrorElement.style.left = '0';
              htmlErrorElement.style.top = '100%';

              // Add arrow to tooltip
              const arrow = document.createElement('div');
              arrow.style.position = 'absolute';
              arrow.style.top = '-5px';
              arrow.style.left = '10px';
              arrow.style.width = '0';
              arrow.style.height = '0';
              arrow.style.borderLeft = '5px solid transparent';
              arrow.style.borderRight = '5px solid transparent';
              arrow.style.borderBottom = '5px solid #e53935';
              errorElement.appendChild(arrow);

              target.parentElement?.appendChild(errorElement);
            }

            errorElement.textContent = message;
          });

          // Clear the validation message when the input changes
          input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            target.setCustomValidity('');

            // Remove error class but keep the touched class
            target.classList.remove('error');

            // Remove tooltip
            const errorElement = target.parentElement?.querySelector('.validation-tooltip');
            if (errorElement) {
              errorElement.remove();
            }
          });
        });
      });
    };

    // Set the custom validation messages
    setCustomValidationMessages();

    // Re-apply when the DOM changes (for dynamically added forms)
    const observer = new MutationObserver(setCustomValidationMessages);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

// Component to initialize form validation
export const FormValidation = () => {
  initializeFormValidation();
  return null;
};




