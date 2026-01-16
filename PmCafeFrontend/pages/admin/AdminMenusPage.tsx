import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, X, Save, Settings } from 'lucide-react';
import { MenuItem as MenuItemType, Category, OptionGroup } from '../../types';
import { menuApi } from '../../shared/api';

interface AdminMenusPageProps {
  onLogout?: () => void;
}

export const AdminMenusPage: React.FC<AdminMenusPageProps> = ({ onLogout }) => {
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedMenu, setSelectedMenu] = useState<MenuItemType | null>(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 API에서 메뉴 불러오기
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await menuApi.getMenus({ include_inactive: true });
      setMenus(data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      setError('메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMenus = selectedCategory === 'ALL'
    ? menus
    : menus.filter(m => m.category === selectedCategory);

  // 🆕 품절 토글 API 호출
  const toggleSoldOut = async (menuId: number) => {
    try {
      await menuApi.toggleSoldOut(menuId);
      setMenus(menus.map(m =>
        m.id === menuId ? { ...m, isSoldOut: !m.isSoldOut } : m
      ));
    } catch (error) {
      console.error('Failed to toggle sold out:', error);
      alert('품절 변경에 실패했습니다');
    }
  };

  const categories = [
    { value: 'ALL' as const, label: '전체' },
    { value: 'COFFEE' as const, label: '☕ 커피' },
    { value: 'NON_COFFEE' as const, label: '🍵 논커피' },
    { value: 'DESSERT' as const, label: '🧁 디저트' },
    { value: 'SEASONAL' as const, label: '⭐ 시즌' },
  ];

  const handleOpenOptionModal = (menu: MenuItemType) => {
    setSelectedMenu(menu);
    setIsOptionModalOpen(true);
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (!window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) return;

    try {
      await menuApi.deleteMenu(menuId);
      setMenus(menus.filter(m => m.id !== menuId));
      alert('메뉴가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete menu:', error);
      alert('메뉴 삭제에 실패했습니다.');
    }
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">메뉴 관리</h1>
            <p className="text-gray-600 mt-1">메뉴 추가, 수정, 품절 관리 및 옵션 설정</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            새 메뉴 추가
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="메뉴 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Menus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
                menu.isSoldOut ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-200 relative">
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  className="w-full h-full object-cover"
                />
                {menu.isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg border-2 border-white px-4 py-2 rotate-12">
                      품절
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{menu.name}</h3>
                  <p className="text-sm text-gray-600">{menu.engName}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {menu.category === 'COFFEE' && '☕ 커피'}
                    {menu.category === 'NON_COFFEE' && '🍵 논커피'}
                    {menu.category === 'DESSERT' && '🧁 디저트'}
                    {menu.category === 'SEASONAL' && '⭐ 시즌'}
                  </span>
                </div>

                <p className="text-xl font-bold text-[#C41E3A] mb-3">
                  ₩{menu.price.toLocaleString()}
                </p>

                {/* Options Summary */}
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>옵션 그룹:</span>
                    <span className="font-medium">{menu.optionGroups?.length || 0}개</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => toggleSoldOut(menu.id)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                      menu.isSoldOut
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {menu.isSoldOut ? <Eye size={16} /> : <EyeOff size={16} />}
                    {menu.isSoldOut ? '판매' : '품절'}
                  </button>
                  <button
                    onClick={() => handleOpenOptionModal(menu)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <Settings size={16} />
                    옵션
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedMenu(menu);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit size={16} />
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-6">
          총 {filteredMenus.length}개 메뉴
        </p>

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || isEditModalOpen) && (
          <MenuFormModal
            menu={isEditModalOpen ? selectedMenu : null}
            onClose={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedMenu(null);
            }}
            onSave={() => {
              fetchMenus();
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedMenu(null);
            }}
          />
        )}

        {/* Option Modal */}
        {isOptionModalOpen && selectedMenu && (
          <MenuOptionModal
            menu={selectedMenu}
            onClose={() => {
              setIsOptionModalOpen(false);
              setSelectedMenu(null);
            }}
            onSave={(updatedMenu) => {
              setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
              setIsOptionModalOpen(false);
              setSelectedMenu(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Menu Form Modal Component (Create/Edit)
interface MenuFormModalProps {
  menu: MenuItemType | null;
  onClose: () => void;
  onSave: () => void;
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({ menu, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: menu?.name || '',
    engName: menu?.engName || '',
    price: menu?.price || 0,
    category: menu?.category || 'COFFEE' as Category,
    description: menu?.description || '',
    imageUrl: menu?.imageUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      alert('메뉴명과 가격은 필수입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (menu) {
        // 수정
        await menuApi.updateMenu(menu.id, formData);
        alert('메뉴가 수정되었습니다.');
      } else {
        // 생성
        await menuApi.createMenu(formData);
        alert('메뉴가 추가되었습니다.');
      }
      onSave();
    } catch (error: any) {
      console.error('Failed to save menu:', error);
      alert(error.response?.data?.message || '메뉴 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold">{menu ? '메뉴 수정' : '새 메뉴 추가'}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메뉴명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                placeholder="아메리카노"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                영문명
              </label>
              <input
                type="text"
                value={formData.engName}
                onChange={(e) => setFormData({ ...formData, engName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                placeholder="Americano"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                placeholder="3500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              >
                <option value="COFFEE">☕ 커피</option>
                <option value="NON_COFFEE">🍵 논커피</option>
                <option value="DESSERT">🧁 디저트</option>
                <option value="SEASONAL">⭐ 시즌</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              rows={3}
              placeholder="풍부한 에스프레소의 깊은 맛과 향을 즐길 수 있는 커피"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이미지 URL
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#C41E3A] hover:bg-[#A01830]'
            } text-white font-bold`}
          >
            {isSubmitting ? '저장 중...' : (menu ? '수정하기' : '추가하기')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Menu Option Modal Component
interface MenuOptionModalProps {
  menu: MenuItemType;
  onClose: () => void;
  onSave: (menu: MenuItemType) => void;
}

const MenuOptionModal: React.FC<MenuOptionModalProps> = ({ menu, onClose, onSave }) => {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(menu.optionGroups || []);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    icon: '',
    type: 'SINGLE' as 'SINGLE' | 'MULTIPLE',
    isRequired: false,
  });

  const handleAddGroup = () => {
    const group: OptionGroup = {
      id: Date.now(),
      name: newGroup.name,
      icon: newGroup.icon,
      type: newGroup.type,
      isRequired: newGroup.isRequired,
      items: []
    };

    setOptionGroups([...optionGroups, group]);
    setIsAddingGroup(false);
    setNewGroup({ name: '', icon: '', type: 'SINGLE', isRequired: false });
  };

  const handleRemoveGroup = (groupId: number) => {
    if (!window.confirm('이 옵션 그룹을 삭제하시겠습니까?')) return;
    setOptionGroups(optionGroups.filter(g => g.id !== groupId));
  };

  const handleAddItem = (groupId: number) => {
    const itemName = prompt('옵션 항목명을 입력하세요:');
    if (!itemName) return;

    const priceStr = prompt('추가 금액을 입력하세요 (없으면 0):');
    const price = parseInt(priceStr || '0');

    setOptionGroups(optionGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: [...g.items, {
            id: Date.now(),
            name: itemName,
            price,
            isDefault: g.items.length === 0
          }]
        };
      }
      return g;
    }));
  };

  const handleRemoveItem = (groupId: number, itemId: number) => {
    setOptionGroups(optionGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.filter(i => i.id !== itemId)
        };
      }
      return g;
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 메뉴 업데이트 시 optionGroupIds만 전송 (백엔드 스키마에 맞춤)
      const optionGroupIds = optionGroups.map(g => g.id);

      await menuApi.updateMenu(menu.id, {
        optionGroupIds: optionGroupIds
      });

      // 로컬 상태 업데이트
      onSave({ ...menu, optionGroups });
      alert('옵션 설정이 저장되었습니다.');
    } catch (error: any) {
      console.error('Failed to save options:', error);
      alert(error.response?.data?.message || '옵션 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold">옵션 설정: {menu.name}</h3>
            <p className="text-sm text-gray-600">메뉴별 옵션 그룹 및 항목 관리</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Option Groups */}
          {optionGroups.map((group) => (
            <div key={group.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <h4 className="font-bold text-lg">{group.name}</h4>
                    <p className="text-xs text-gray-600">
                      {group.type === 'SINGLE' ? '단일선택' : '다중선택'}
                      {group.isRequired && ' · 필수'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveGroup(group.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Option Items */}
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.name}</span>
                      {item.price > 0 && (
                        <span className="text-sm text-gray-600">+₩{item.price.toLocaleString()}</span>
                      )}
                      {item.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">기본</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(group.id, item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => handleAddItem(group.id)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  옵션 항목 추가
                </button>
              </div>
            </div>
          ))}

          {/* Add Group Section */}
          {isAddingGroup ? (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold mb-4">새 옵션 그룹 추가</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      그룹명 *
                    </label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="예: 온도 선택"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      아이콘
                    </label>
                    <input
                      type="text"
                      value={newGroup.icon}
                      onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="🌡️"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      선택 타입 *
                    </label>
                    <select
                      value={newGroup.type}
                      onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="SINGLE">단일선택</option>
                      <option value="MULTIPLE">다중선택</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newGroup.isRequired}
                        onChange={(e) => setNewGroup({ ...newGroup, isRequired: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">필수 선택</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddGroup}
                    disabled={!newGroup.name}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      newGroup.name
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setIsAddingGroup(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingGroup(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#C41E3A] hover:text-[#C41E3A] transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              새 옵션 그룹 추가
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-bold ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#C41E3A] hover:bg-[#A01830]'
            } text-white`}
          >
            <Save size={20} />
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
