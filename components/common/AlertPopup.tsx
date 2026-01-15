import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmText = '确定',
  onConfirm,
  showCancel = false,
  cancelText = '取消',
  onCancel
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
          >
            {/* 标题 */}
            {title && (
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                {title}
              </h3>
            )}

            {/* 内容 */}
            <p className="text-gray-600 text-center mb-6">{message}</p>

            {/* 按钮 */}
            <div className="flex gap-3">
              {showCancel && (
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 px-4 bg-[#0052D9] text-white font-medium rounded-lg hover:bg-[#0041B3] transition-colors ${showCancel ? '' : 'w-full'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};