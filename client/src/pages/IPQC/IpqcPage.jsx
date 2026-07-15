import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import GlobalModal from '../../components/GlobalModal';
import ConfirmModal from '../../components/ConfirmModal';
import { request } from '../../utils/api';

const IpqcPage = () => {
  // 基礎狀態
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 提示訊息狀態
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const [confirm, setConfirm] = useState({ show: false, title: '', message: '', onConfirm: () => {} });

  // 子對話視窗控制
  const [subModal, setSubModal] = useState({ show: false, type: '', title: '' });
  const [subSearch, setSubSearch] = useState('');
  const [subList, setSubList] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [subPage, setSubPage] = useState(1);
  const [subForm, setSubForm] = useState({});

  // 關聯選項下拉緩存
  const [operators, setOperators] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);

  // 主表單 Modal (新增/編輯)
  const [formModalShow, setFormModalShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [ipqcForm, setIpqcForm] = useState({
    date: '', time: '', order_number: '', operator: '', draw_ver: '',
    product_number: '', product_name: '', spec: '', quantity: 0,
    inspector: '', determination: '合格', defect_classification: '',
    defect_status: '', handling_measures: '', remark: ''
  });

  // 載入主列表
  const fetchIpqcList = async () => {
    setLoading(true);
    try {
      const url = `/ipqc?page=${currentPage}&limit=10&search=${searchQuery}&startDate=${startDate}&endDate=${endDate}`;
      const res = await request(url);
      setDataList(res.data);
      setTotalRecords(res.total);
    } catch (err) {
      setModal({ show: true, title: '錯誤', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpqcList();
  }, [currentPage, startDate, endDate]);

  // 載入關聯下拉選單資料
  const loadRelationData = async () => {
    try {
      const ops = await request('/operator?limit=100');
      const defs = await request('/defect?limit=100');
      setOperators(ops.data);
      setDefectTypes(defs.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRelationData();
  }, []);

  // 模糊工單自動補完與代入
  const handleOrderChange = async (val) => {
    setIpqcForm(prev => ({ ...prev, order_number: val }));
    if (!val) return;
    try {
      const ordersRes = await request(`/order?search=${val}&limit=5`);
      const foundOrder = ordersRes.data.find(o => o.order_number === val);
      if (foundOrder) {
        // 自動帶上品號、品名與數量
        setIpqcForm(prev => ({
          ...prev,
          product_number: foundOrder.product_number,
          product_name: foundOrder.product_name,
          quantity: foundOrder.quantity
        }));

        // 進一步帶出 spec_list 對應的規格與圖面版本
        const specsRes = await request(`/spec?search=${foundOrder.product_number}`);
        const foundSpec = specsRes.data.find(s => s.product_number === foundOrder.product_number);
        if (foundSpec) {
          setIpqcForm(prev => ({
            ...prev,
            spec: foundSpec.spec,
            draw_ver: foundSpec.version
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 匯出 Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(dataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IPQC_Report");
    XLSX.writeFile(wb, "IPQC_Inspection_Records.xlsx");
  };

  // 匯入 Excel
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        await request('/ipqc/import', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        setModal({ show: true, title: '成功', message: 'Excel 匯入完成！' });
        fetchIpqcList();
      } catch (err) {
        setModal({ show: true, title: '匯入失敗', message: err.message });
      }
    };
    reader.readAsBinaryString(file);
  };

  // 主表單保存
  const handleSaveIpqc = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await request(`/ipqc/${editingId}`, { method: 'PUT', body: JSON.stringify(ipqcForm) });
        setModal({ show: true, title: '成功', message: '品質記錄更新成功。' });
      } else {
        await request('/ipqc', { method: 'POST', body: JSON.stringify(ipqcForm) });
        setModal({ show: true, title: '成功', message: '品質記錄新增完成。' });
      }
      setFormModalShow(false);
      fetchIpqcList();
    } catch (err) {
      setModal({ show: true, title: '儲存失敗', message: err.message });
    }
  };

  const handleEditClick = (record) => {
    setEditingId(record._id);
    setIpqcForm({ ...record });
    setFormModalShow(true);
  };

  const handleDeleteClick = (id) => {
    setConfirm({
      show: true,
      title: '刪除檢驗紀錄',
      message: '您確定要永久刪除此筆 IPQC 檢驗記錄嗎？此動作將無法復原。',
      onConfirm: async () => {
        try {
          await request(`/ipqc/${id}`, { method: 'DELETE' });
          setModal({ show: true, title: '成功', message: '記錄已順利刪除。' });
          fetchIpqcList();
        } catch (err) {
          setModal({ show: true, title: '錯誤', message: err.message });
        } finally {
          setConfirm({ ...confirm, show: false });
        }
      }
    });
  };

  // ==================== 子模組維護邏輯 (Defect, Order, Operator, Spec) ====================
  const loadSubList = async (type, page = 1, search = '') => {
    try {
      const res = await request(`/${type}?page=${page}&limit=5&search=${search}`);
      setSubList(res.data);
      setSubTotal(res.total);
    } catch (err) {
      setModal({ show: true, title: '錯誤', message: '無法載入子項目清單' });
    }
  };

  const openSubModule = (type, title) => {
    setSubModal({ show: true, type, title });
    setSubSearch('');
    setSubPage(1);
    setSubForm({});
    loadSubList(type, 1, '');
  };

  const handleSubSave = async (e) => {
    e.preventDefault();
    const { type } = subModal;
    try {
      if (subForm._id) {
        await request(`/${type}/${subForm._id}`, { method: 'PUT', body: JSON.stringify(subForm) });
      } else {
        await request(`/${type}`, { method: 'POST', body: JSON.stringify(subForm) });
      }
      setSubForm({});
      loadSubList(type, subPage, subSearch);
      loadRelationData(); // 重新整理外鍵下拉選單
    } catch (err) {
      setModal({ show: true, title: '操作失敗', message: err.message });
    }
  };

  const handleSubDelete = (id) => {
    setConfirm({
      show: true,
      title: '確認刪除',
      message: '您確定要刪除此關聯子項資料嗎？',
      onConfirm: async () => {
        try {
          await request(`/${subModal.type}/${id}`, { method: 'DELETE' });
          loadSubList(subModal.type, subPage, subSearch);
          loadRelationData();
        } catch (err) {
          setModal({ show: true, title: '刪除失敗', message: err.message });
        } finally {
          setConfirm(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  // ==================== 頁碼計算輔助 ====================
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalRecords / 10);
    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatText = (text) => {
    if (!text || text.toString().toLowerCase() === 'none' || text.toString().toLowerCase() === 'empty') return '';
    if (text.length > 10) {
      return (
        <span title={text} style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}>
          {text.substring(0, 10)}...
        </span>
      );
    }
    return text;
  };

  return (
    <div className="container-fluid p-4">
      {/* 搜尋與操作工具列 */}
      <div className="row g-3 mb-4 align-items-center">
        {/* 左側：關鍵字篩選 */}
        <div className="col-lg-3">
          <input
            type="text"
            className="form-control"
            placeholder="關鍵字搜尋 (工單、品號、檢驗員...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && fetchIpqcList()}
          />
        </div>
        {/* 中間：日期起迄 */}
        <div className="col-lg-4 d-flex align-items-center">
          <input type="date" className="form-control me-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span className="me-2">至</span>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {/* 右側：匯入匯出與新增 */}
        <div className="col-lg-5 text-end">
          <button className="btn btn-outline-secondary me-2" onClick={handleExport}>
            <i className="bi bi-file-earmark-arrow-up me-1"></i>匯出備份
          </button>
          <label className="btn btn-outline-secondary me-2 mb-0">
            <i className="bi bi-file-earmark-arrow-down me-1"></i>匯入資料
            <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button className="btn btn-primary" onClick={() => {
            const user = JSON.parse(localStorage.getItem('user'));
            setEditingId(null);
            setIpqcForm({
              date: new Date().toISOString().split('T')[0],
              time: new Date().toTimeString().substring(0, 5),
              order_number: '', operator: '', draw_ver: '',
              product_number: '', product_name: '', spec: '', quantity: 0,
              inspector: user?.nickname || '品管人員', determination: '合格', defect_classification: '',
              defect_status: '', handling_measures: '', remark: ''
            });
            setFormModalShow(true);
          }}>
            <i className="bi bi-plus-lg me-1"></i>新增紀錄
          </button>
        </div>
      </div>

      {/* 資料載入狀態與筆數顯示 */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-info text-dark">
          顯示第 {Math.min((currentPage - 1) * 10 + 1, totalRecords)}-{Math.min(currentPage * 10, totalRecords)} 筆，共 {totalRecords} 筆
        </span>
      </div>

      {/* 數據表格 */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2"><i className="bi bi-hourglass-split"></i> 資料載入中...</p>
        </div>
      ) : dataList.length === 0 ? (
        <div className="alert alert-warning text-center">目前沒有待辦事項</div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-dark">
              <tr>
                <th>日期/時間</th>
                <th>製令工單</th>
                <th>品號/品名/規格</th>
                <th>數量</th>
                <th>巡檢員</th>
                <th>判定</th>
                <th>不良分類</th>
                <th>不良狀況</th>
                <th>處置措施</th>
                <th>備註</th>
                <th>操作項目</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.date} <br />
                    <small className="text-muted">{r.time}</small>
                  </td>
                  <td>{r.order_number}</td>
                  <td className="text-start">
                    <strong>{r.product_number}</strong><br />
                    <span>{r.product_name}</span><br />
                    <small className="text-muted">{r.spec}</small>
                  </td>
                  <td>{r.quantity}</td>
                  <td>{r.inspector}</td>
                  <td>
                    <span className={`badge ${r.determination === '合格' ? 'bg-success' : 'bg-danger'}`}>
                      {r.determination}
                    </span>
                  </td>
                  <td>{r.defect_classification}</td>
                  <td>{formatText(r.defect_status)}</td>
                  <td>{formatText(r.handling_measures)}</td>
                  <td>{formatText(r.remark)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(r)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(r._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 主分頁器 */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
            </li>
            {getPageNumbers().map(num => (
              <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(num)}>{num}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === Math.ceil(totalRecords / 10) ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(Math.ceil(totalRecords / 10))}>»</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* ==================== 1. 新增/編輯 IPQC 主表單 Modal ==================== */}
      {formModalShow && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{editingId ? '編輯巡檢記錄' : '新增巡檢記錄'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setFormModalShow(false)}></button>
              </div>
              <form onSubmit={handleSaveIpqc}>
                <div className="modal-body">
                  {/* 第一列：日期、時間、工單編號 */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">日期</label>
                      <input type="date" className="form-control form-control-sm" required value={ipqcForm.date} onChange={e => setIpqcForm({ ...ipqcForm, date: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">時間</label>
                      <input type="time" className="form-control form-control-sm" required value={ipqcForm.time} onChange={e => setIpqcForm({ ...ipqcForm, time: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold d-flex justify-content-between">
                        製令工單
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('order', '工單資料庫')}></i>
                      </label>
                      <input type="text" className="form-control form-control-sm" required placeholder="鍵入以模糊補全" value={ipqcForm.order_number} onChange={e => handleOrderChange(e.target.value)} />
                    </div>
                  </div>

                  {/* 第二列：品號、品名、數量 */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">品號 (自動聯動)</label>
                      <input type="text" className="form-control form-control-sm" required value={ipqcForm.product_number} onChange={e => setIpqcForm({ ...ipqcForm, product_number: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">品名 (自動聯動)</label>
                      <input type="text" className="form-control form-control-sm" required value={ipqcForm.product_name} onChange={e => setIpqcForm({ ...ipqcForm, product_name: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">數量</label>
                      <input type="number" className="form-control form-control-sm" required value={ipqcForm.quantity} onChange={e => setIpqcForm({ ...ipqcForm, quantity: parseInt(e.target.value) })} />
                    </div>
                  </div>

                  {/* 第三列：規格、版次 */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold d-flex justify-content-between">
                        規格
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('spec', '圖面規格資料庫')}></i>
                      </label>
                      <input type="text" className="form-control form-control-sm" value={ipqcForm.spec} onChange={e => setIpqcForm({ ...ipqcForm, spec: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">版次 (自動)</label>
                      <input type="text" className="form-control form-control-sm" value={ipqcForm.draw_ver} onChange={e => setIpqcForm({ ...ipqcForm, draw_ver: e.target.value })} />
                    </div>
                  </div>

                  {/* 第四列：作業員、巡檢員 */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold d-flex justify-content-between">
                        作業員
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('operator', '作業員資料庫')}></i>
                      </label>
                      <select className="form-select form-select-sm" value={ipqcForm.operator} onChange={e => setIpqcForm({ ...ipqcForm, operator: e.target.value })}>
                        <option value="">選擇作業員...</option>
                        {operators.map(op => <option key={op._id} value={op.name}>{op.name} ({op.department})</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">巡檢員</label>
                      <select className="form-select form-select-sm" value={ipqcForm.inspector} onChange={e => setIpqcForm({ ...ipqcForm, inspector: e.target.value })}>
                        <option value="">選擇巡檢員 (限品管)...</option>
                        {operators.filter(o => o.department === '正義廠品管課').map(op => <option key={op._id} value={op.name}>{op.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 第五列：判定、不良分類 */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">判定結果</label>
                      <select className="form-select form-select-sm" value={ipqcForm.determination} onChange={e => setIpqcForm({ ...ipqcForm, determination: e.target.value })}>
                        <option value="合格">合格</option>
                        <option value="不合格">不合格</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold d-flex justify-content-between">
                        不良分類
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('defect', '缺陷代碼資料庫')}></i>
                      </label>
                      <select className="form-select form-select-sm" value={ipqcForm.defect_classification} onChange={e => setIpqcForm({ ...ipqcForm, defect_classification: e.target.value })}>
                        <option value="">選擇不良分類...</option>
                        {defectTypes.map(df => <option key={df._id} value={df.defect_type}>{df.defect_type} - {df.description}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 附加：不良狀況 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">不良狀況描述</label>
                    <textarea className="form-control form-control-sm" rows="2" value={ipqcForm.defect_status} onChange={e => setIpqcForm({ ...ipqcForm, defect_status: e.target.value })}></textarea>
                  </div>

                  {/* 附加：處置措施 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">現場處置措施</label>
                    <textarea className="form-control form-control-sm" rows="2" value={ipqcForm.handling_measures} onChange={e => setIpqcForm({ ...ipqcForm, handling_measures: e.target.value })}></textarea>
                  </div>

                  {/* 附加：備註 */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">備註</label>
                    <input type="text" className="form-control form-control-sm" value={ipqcForm.remark} onChange={e => setIpqcForm({ ...ipqcForm, remark: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setFormModalShow(false)}>取消</button>
                  <button type="submit" className="btn btn-success">儲存資料</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. 子模組維護對話方塊 (Sub-Module CRUD) ==================== */}
      {subModal.show && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">{subModal.title} (CRUD系統聯動)</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSubModal({ ...subModal, show: false })}></button>
              </div>
              <div className="modal-body">
                {/* 搜尋與新增表單 */}
                <form onSubmit={handleSubSave} className="row g-2 mb-3 align-items-end border-bottom pb-3">
                  {subModal.type === 'defect' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label small">不良代碼</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.defect_code || ''} onChange={e => setSubForm({...subForm, defect_code: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">分類名稱</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.defect_type || ''} onChange={e => setSubForm({...subForm, defect_type: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">描述</label>
                        <input type="text" className="form-control form-control-sm" value={subForm.description || ''} onChange={e => setSubForm({...subForm, description: e.target.value})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'order' && (
                    <>
                      <div className="col-md-3">
                        <label className="form-label small">製令工單</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.order_number || ''} onChange={e => setSubForm({...subForm, order_number: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">品號</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_number || ''} onChange={e => setSubForm({...subForm, product_number: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">品名</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_name || ''} onChange={e => setSubForm({...subForm, product_name: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">工單數量</label>
                        <input type="number" className="form-control form-control-sm" required value={subForm.quantity || 0} onChange={e => setSubForm({...subForm, quantity: parseInt(e.target.value)})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'operator' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label small">工號</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.operator_id || ''} onChange={e => setSubForm({...subForm, operator_id: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">姓名</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.name || ''} onChange={e => setSubForm({...subForm, name: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">部門</label>
                        <input type="text" className="form-control form-control-sm" placeholder="如：正義廠品管課" required value={subForm.department || ''} onChange={e => setSubForm({...subForm, department: e.target.value})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'spec' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label small">關聯品號</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_number || ''} onChange={e => setSubForm({...subForm, product_number: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">規格尺寸</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.spec || ''} onChange={e => setSubForm({...subForm, spec: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">工程圖版次</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.version || ''} onChange={e => setSubForm({...subForm, version: e.target.value})} />
                      </div>
                    </>
                  )}
                  <div className="col-12 mt-2 text-end">
                    <button type="submit" className="btn btn-sm btn-success me-2">
                      <i className="bi bi-save"></i> 儲存此項
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSubForm({})}>重設</button>
                  </div>
                </form>

                {/* 資料篩選與渲染 */}
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm me-2"
                    placeholder="在目前子分類中模糊搜尋"
                    value={subSearch}
                    onChange={e => {
                      setSubSearch(e.target.value);
                      loadSubList(subModal.type, 1, e.target.value);
                    }}
                  />
                </div>

                <table className="table table-sm table-bordered align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      {subModal.type === 'defect' && <><th>代碼</th><th>分類</th><th>描述</th></>}
                      {subModal.type === 'order' && <><th>工單</th><th>品號</th><th>名稱</th><th>數量</th></>}
                      {subModal.type === 'operator' && <><th>工號</th><th>姓名</th><th>部門</th></>}
                      {subModal.type === 'spec' && <><th>品號</th><th>規格</th><th>版次</th></>}
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subList.map(item => (
                      <tr key={item._id}>
                        {subModal.type === 'defect' && <><td>{item.defect_code}</td><td>{item.defect_type}</td><td>{item.description}</td></>}
                        {subModal.type === 'order' && <><td>{item.order_number}</td><td>{item.product_number}</td><td>{item.product_name}</td><td>{item.quantity}</td></>}
                        {subModal.type === 'operator' && <><td>{item.operator_id}</td><td>{item.name}</td><td>{item.department}</td></>}
                        {subModal.type === 'spec' && <><td>{item.product_number}</td><td>{item.spec}</td><td>{item.version}</td></>}
                        <td>
                          <button className="btn btn-xs btn-outline-primary me-1 py-0 px-1" onClick={() => setSubForm(item)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-xs btn-outline-danger py-0 px-1" onClick={() => handleSubDelete(item._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSubModal({ ...subModal, show: false })}>關閉</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 全域反饋 Modal */}
      <GlobalModal show={modal.show} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />
      {/* 詢問確認防護防 */}
      <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm({ ...confirm, show: false })} />
    </div>
  );
};

export default IpqcPage;