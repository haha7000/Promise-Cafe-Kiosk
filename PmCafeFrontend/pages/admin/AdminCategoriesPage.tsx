import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { categoryApi, type Category } from '../../shared/api';

interface AdminCategoriesPageProps {
  onLogout?: () => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    displayOrder: 0,
  });

  // 카테고리 목록 로드
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryApi.getCategories(true);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || '카테고리 목록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      displayOrder: category.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      alert('카테고리 코드와 이름은 필수입니다.');
      return;
    }

    try {
      setIsLoading(true);
      if (editingCategory) {
        // 수정
        await categoryApi.updateCategory(editingCategory.id, formData);
        alert('카테고리가 수정되었습니다.');
      } else {
        // 생성
        await categoryApi.createCategory(formData);
        alert('카테고리가 추가되었습니다.');
      }
      await fetchCategories();
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ code: '', name: '', displayOrder: 0 });
    } catch (err: any) {
      alert(err.message || '카테고리 저장에 실패했습니다.');
      console.error('Failed to save category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 카테고리를 삭제하시겠습니까?\n연결된 메뉴가 있을 경우 오류가 발생할 수 있습니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      await categoryApi.deleteCategory(id);
      alert('카테고리가 삭제되었습니다.');
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || '카테고리 삭제에 실패했습니다.');
      console.error('Failed to delete category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      setIsLoading(true);
      await categoryApi.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || '상태 변경에 실패했습니다.');
      console.error('Failed to toggle category status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (code: string) => {
    const iconMap: Record<string, string> = {
      'COFFEE': '☕',
      'NON_COFFEE': '🍵',
      'DESSERT': '🧁',
      'SEASONAL': '⭐',
    };
    return iconMap[code] || '📦';
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
            <p className="text-gray-600 mt-1">카테고리 추가, 수정 및 관리</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ code: '', name: '', displayOrder: 0 });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            새 카테고리 추가
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            💡 카테고리 순서는 키오스크 탭 순서에 반영됩니다. displayOrder 값으로 순서를 조정할 수 있습니다.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8 text-gray-600">
            ⏳ 로딩 중...
          </div>
        )}

        {/* Categories Table */}
        {!isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">순서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">아이콘</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">카테고리명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">코드</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">생성일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      등록된 카테고리가 없습니다.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{category.displayOrder}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl">{getCategoryIcon(category.code)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {category.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(category)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {category.isActive ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(category.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Edit size={14} />
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={14} />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingCategory ? '카테고리 수정' : '카테고리 추가'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 코드 * (영문 대문자)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={!!editingCategory}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A] disabled:bg-gray-100"
                    placeholder="COFFEE"
                  />
                  {editingCategory && (
                    <p className="text-xs text-gray-600 mt-1">
                      카테고리 코드는 수정할 수 없습니다.
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="커피"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    표시 순서
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    숫자가 작을수록 먼저 표시됩니다.
                  </p>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.code || isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    formData.name && formData.code && !isLoading
                      ? 'bg-[#C41E3A] text-white hover:bg-[#A01830]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={20} />
                  {isLoading ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
