// pages/owner-dishes/owner-dishes.js 老板端菜品管理
const api = require('../../utils/api.js');
const app = getApp();

function emptyForm() {
  return {
    categoryIndex: 0,
    name: '',
    price: '',
    stock: '',
    emoji: '',
    description: '',
    status: 1
  };
}

Page({
  data: {
    categories: [],
    dishes: [],
    loading: true,
    editorVisible: false,
    editingId: null,
    form: emptyForm(),
    saving: false
  },

  onLoad() {
    if (!app.globalData.isOwner) {
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return;
    }
    this.loadAll();
  },

  loadAll() {
    return Promise.all([api.getCategories(), api.ownerGetDishes()])
      .then(([categories, dishes]) => {
        this.setData({ categories, dishes, loading: false });
      })
      .catch(err => {
        this.setData({ loading: false });
        this.handleAuthError(err);
      });
  },

  handleAuthError(err) {
    if (err && (err.statusCode === 401 || err.code === 401)) {
      app.clearOwnerSession();
      wx.reLaunch({ url: '/pages/owner-login/owner-login' });
      return true;
    }
    wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    return false;
  },

  onAdd() {
    this.setData({
      editorVisible: true,
      editingId: null,
      form: emptyForm()
    });
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => d.id === id);
    if (!dish) return;
    const categoryIndex = Math.max(0, this.data.categories.findIndex(c => c.id === dish.categoryId));
    this.setData({
      editorVisible: true,
      editingId: id,
      form: {
        categoryIndex,
        name: dish.name,
        price: String(dish.price),
        stock: String(dish.stock),
        emoji: dish.emoji || '',
        description: dish.description || '',
        status: dish.status
      }
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCategoryChange(e) {
    this.setData({ 'form.categoryIndex': Number(e.detail.value) });
  },

  onStatusChange(e) {
    this.setData({ 'form.status': e.detail.value ? 1 : 0 });
  },

  onClose() {
    if (this.data.saving) return;
    this.setData({ editorVisible: false });
  },

  onSave() {
    if (this.data.saving) return;
    const form = this.data.form;
    const category = this.data.categories[form.categoryIndex];
    const name = (form.name || '').trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!category) {
      wx.showToast({ title: '请选择菜品分类', icon: 'none' });
      return;
    }
    if (!name) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' });
      return;
    }
    if (!(price > 0)) {
      wx.showToast({ title: '请输入正确的价格', icon: 'none' });
      return;
    }
    if (!(stock >= 0) || !Number.isInteger(stock)) {
      wx.showToast({ title: '库存必须是非负整数', icon: 'none' });
      return;
    }

    const payload = {
      id: this.data.editingId,
      categoryId: category.id,
      name,
      price,
      stock,
      emoji: (form.emoji || '').trim(),
      description: (form.description || '').trim(),
      status: form.status
    };

    this.setData({ saving: true });
    api.ownerSaveDish(payload)
      .then(() => {
        wx.showToast({ title: this.data.editingId ? '保存成功' : '新增成功', icon: 'success' });
        this.setData({ editorVisible: false });
        return this.loadAll();
      })
      .catch(err => {
        if (!this.handleAuthError(err)) {
          wx.showToast({ title: err.message || '保存失败', icon: 'none' });
        }
      })
      .then(() => this.setData({ saving: false }));
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    const status = Number(e.currentTarget.dataset.status);
    const next = status === 1 ? 0 : 1;
    api.ownerSetDishStatus(id, next)
      .then(() => {
        wx.showToast({ title: next === 1 ? '已上架' : '已停售', icon: 'success' });
        return this.loadAll();
      })
      .catch(err => {
        if (!this.handleAuthError(err)) {
          wx.showToast({ title: err.message || '操作失败', icon: 'none' });
        }
      });
  },

  onPullDownRefresh() {
    this.loadAll().then(
      () => wx.stopPullDownRefresh(),
      () => wx.stopPullDownRefresh()
    );
  },

  noop() {}
});
