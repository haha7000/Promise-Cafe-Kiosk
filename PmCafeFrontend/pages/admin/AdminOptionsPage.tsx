import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface OptionItem {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

interface OptionGroup {
  id: string;
  name: string;
  icon: string;
  type: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  items: OptionItem[];
  appliedTo: string[];
}

interface AdminOptionsPageProps {
  onLogout?: () => void;
}

export const AdminOptionsPage: React.FC<AdminOptionsPageProps> = ({ onLogout }) => {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([
    {
      id: '1',
      name: '온도 선택',
      icon: '🌡️',
      type: 'SINGLE',
      isRequired: true,
      items: [
        { id: '101', name: 'HOT', price: 0, isDefault: true },
        { id: '102', name: 'ICE', price: 0, isDefault: false },
      ],
      appliedTo: ['커피', '논커피', '시즌메뉴']
    },
    {
      id: '2',
      name: '사이즈 선택',
      icon: '📏',
      type: 'SINGLE',
      isRequired: true,
      items: [
        { id: '201', name: 'R (Regular)', price: 0, isDefault: true },
        { id: '202', name: 'L (Large)', price: 500, isDefault: false },
        { id: '203', name: 'XL (Extra Large)', price: 1000, isDefault: false },
      ],
      appliedTo: ['커피', '논커피', '시즌메뉴']
    },
    {
      id: '3',
      name: '추가 옵션',
      icon: '➕',
      type: 'MULTIPLE',
      isRequired: false,
      items: [
        { id: '301', name: '샷 추가', price: 500, isDefault: false },
        { id: '302', name: '바닐라 시럽', price: 300, isDefault: false },
        { id: '303', name: '헤이즐넛 시럽', price: 300, isDefault: false },
        { id: '304', name: '카라멜 시럽', price: 300, isDefault: false },
        { id: '305', name: '휘핑크림', price: 500, isDefault: false },
      ],
      appliedTo: ['커피']
    },
  ]);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<OptionGroup | null>(null);
  const [editingItem, setEditingItem] = useState<OptionItem | null>(null);

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    icon: '',
    type: 'SINGLE' as 'SINGLE' | 'MULTIPLE',
    isRequired: false,
    appliedTo: [] as string[]
  });

  const [itemFormData, setItemFormData] = useState({
    name: '',
    price: 0,
    isDefault: false
  });

  const categories = ['커피', '논커피', '디저트', '시즌메뉴'];

  const handleAddItem = (group: OptionGroup) => {
    setSelectedGroup(group);
    setEditingItem(null);
    setItemFormData({ name: '', price: 0, isDefault: false });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!selectedGroup) return;

    const newItem: OptionItem = {
      id: Date.now().toString(),
      ...itemFormData
    };

    setOptionGroups(optionGroups.map(g =>
      g.id === selectedGroup.id
        ? { ...g, items: [...g.items, newItem] }
        : g
    ));

    setIsItemModalOpen(false);
    setItemFormData({ name: '', price: 0, isDefault: false });
  };

  const handleDeleteItem = (groupId: string, itemId: string) => {
    if (!window.confirm('이 옵션 항목을 삭제하시겠습니까?')) return;

    setOptionGroups(optionGroups.map(g =>
      g.id === groupId
        ? { ...g, items: g.items.filter(i => i.id !== itemId) }
        : g
    ));
  };

  const toggleAppliedCategory = (category: string) => {
    setGroupFormData(prev => ({
      ...prev,
      appliedTo: prev.appliedTo.includes(category)
        ? prev.appliedTo.filter(c => c !== category)
        : [...prev.appliedTo, category]
    }));
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">옵션 관리</h1>
            <p className="text-gray-600 mt-1">옵션 그룹 및 항목 관리</p>
          </div>
          <button
            onClick={() => {
              setGroupFormData({ name: '', icon: '', type: 'SINGLE', isRequired: false, appliedTo: [] });
              setIsGroupModalOpen(true);
            }}
            className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            새 옵션 그룹 추가
          </button>
        </div>

        {/* Option Groups */}
        <div className="space-y-6">
          {optionGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          타입: <span className="font-medium">
                            {group.type === 'SINGLE' ? '단일선택' : '다중선택'}
                            {group.isRequired && ' (필수)'}
                          </span>
                        </span>
                        <span className="text-sm text-gray-600">
                          적용: <span className="font-medium">{group.appliedTo.join(', ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                      그룹 수정
                    </button>
                    <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors">
                      그룹 삭제
                    </button>
                  </div>
                </div>
              </div>

              {/* Option Items */}
              <div className="p-6">
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.price > 0 && (
                          <span className="text-sm text-gray-600">+₩{item.price.toLocaleString()}</span>
                        )}
                        {item.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">기본 ✓</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <Edit size={14} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(group.id, item.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddItem(group)}
                  className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C41E3A] hover:text-[#C41E3A] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  항목 추가
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Modal */}
        {isItemModalOpen && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">옵션 항목 추가</h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">소속 그룹</p>
                  <p className="font-medium">{selectedGroup.icon} {selectedGroup.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    옵션명 *
                  </label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="예: ICE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 금액 *
                  </label>
                  <input
                    type="number"
                    value={itemFormData.price}
                    onChange={(e) => setItemFormData({ ...itemFormData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 추가 금액이 없으면 0을 입력하세요
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.isDefault}
                      onChange={(e) => setItemFormData({ ...itemFormData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-[#C41E3A] border-gray-300 rounded focus:ring-[#C41E3A]"
                    />
                    <span className="text-sm text-gray-700">이 옵션을 기본으로 선택</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    💡 단일선택 그룹에서 하나만 기본 설정 가능
                  </p>
                </div>

                <button
                  onClick={handleSaveItem}
                  disabled={!itemFormData.name}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    itemFormData.name
                      ? 'bg-[#C41E3A] text-white hover:bg-[#A01830]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={20} />
                  저장하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
