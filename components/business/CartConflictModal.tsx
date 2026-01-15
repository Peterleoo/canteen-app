import React from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { AlertPopup } from '../common/AlertPopup';

export const CartConflictModal: React.FC = () => {
    const {
        conflictProduct,
        canteenName: currentCanteenName,
        confirmClearAndAdd,
        cancelConflict
    } = useCartStore();

    const isVisible = !!conflictProduct;
    const newCanteenName = conflictProduct?.canteen?.name || '其他食堂';

    return (
        <AlertPopup
            visible={isVisible}
            onClose={cancelConflict}
            title="切换食堂确认"
            message={`您的购物车中已有“${currentCanteenName || '其他食堂'}”的商品，加入“${newCanteenName}”的商品将清空原有购物车，是否继续？`}
            confirmText="确认并清空"
            onConfirm={() => {
                confirmClearAndAdd();
            }}
            showCancel={true}
            cancelText="取消"
            onCancel={cancelConflict}
        />
    );
};
