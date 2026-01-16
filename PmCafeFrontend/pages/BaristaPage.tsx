import React from 'react';
import { BaristaView } from '../components/BaristaView';
import { useOrders } from '../shared/contexts/OrderContext';

export const BaristaPage: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();

  return (
    <BaristaView
      orders={orders}
      onUpdateStatus={updateOrderStatus}
    />
  );
};
