import React, { useState, useEffect, useRef } from 'react';
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

  // --- 新增：模糊工單下拉選單控制狀態 ---
  const [orderSuggestions, setOrderSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // 主表單 Modal (新增/編輯)
  const [formModalShow, setFormModalShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [ipqcForm, setIpqcForm] = useState({
    date: '', time: '', order_number: '', operator: '', draw_ver: '',
    product_number: '', product_name: '', spec: '', quantity: 0,
    inspector: '', determination: '合格', defect_classification: '',
    defect_status: '', handling_measures: '', remark: ''
  });

  // 監聽點擊外部事件以關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // ==================== 模糊工單鍵入搜尋與選取聯動邏輯 ====================
  
  // 1. 當使用者在「製令工單」欄位輸入時
  const handleOrderChange = async (val) => {
    setIpqcForm(prev => ({ ...prev, order_number: val }));
    
    if (!val.trim()) {
      setOrderSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // 模糊查詢後端工單（回傳最多5筆相關推薦）
      const ordersRes = await request(`/order?search=${val}&limit=5`);
      setOrderSuggestions(ordersRes.data || []);
      setShowSuggestions(ordersRes.data && ordersRes.data.length > 0);
    } catch (err) {
      console.error('工單模糊查詢失敗:', err);
    }
  };

  // 2. 當使用者點擊推薦選單中的某一筆工單時 (執行核心聯動)
  const selectOrder = async (orderObj) => {
    // 關閉下拉選單
    setShowSuggestions(false);

    // a. 優先帶入工單基本資訊（工單號、品號、品名、數量）
    setIpqcForm(prev => ({
      ...prev,
      order_number: orderObj.order_number,
      product_number: orderObj.product_number,
      product_name: orderObj.product_name,
      quantity: orderObj.quantity,
      // 先清空規格與版次，等候二級查詢結果
      spec: '',
      draw_ver: ''
    }));

    // b. 二級自動聯動：拿品號 (product_number) 去規格資料庫查詢對應規格尺寸與版次
    try {
      const specsRes = await request(`/spec?search=${orderObj.product_number}&limit=5`);
      
      // 尋找品號完全吻合的規格記錄
      const foundSpec = specsRes.data.find(s => s.product_number === orderObj.product_number) || specsRes.data[0];
      
      if (foundSpec) {
        setIpqcForm(prev => ({
          ...prev,
          spec: foundSpec.spec,
          draw_ver: foundSpec.version
        }));
      }
    } catch (err) {
      console.error('規格聯動查詢失敗:', err);
    }
  };

  // =======================================================================

  // 匯出 Excel (主表單)
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(dataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IPQC_Report");
    XLSX.writeFile(wb, "IPQC_Inspection_Records.xlsx");
  };

  // 匯入 Excel (主表單)
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
      loadRelationData();
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

  const handleSubExport = async () => {
    const { type, title } = subModal;
    try {
      const res = await request(`/${type}?limit=10000`);
      if (!res.data || res.data.length === 0) {
        setModal({ show: true, title: '提示', message: '此子模組目前無資料可供匯出。' });
        return;
      }
      const cleanedData = res.data.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);
      const ws = XLSX.utils.json_to_sheet(cleanedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
      XLSX.writeFile(wb, `${title}_備份_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      setModal({ show: true, title: '備份導出失敗', message: err.message });
    }
  };

  const handleSubImport = (e) => {
    const { type, title } = subModal;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          throw new Error('選擇的 Excel 檔案中無有效數據。');
        }

        const cleanedData = rawData.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

        await request(`/${type}/import`, {
          method: 'POST',
          body: JSON.stringify(cleanedData)
        });

        setModal({ show: true, title: '成功', message: `【${title}】批次資料導入完成！` });
        loadSubList(type, subPage, subSearch);
        loadRelationData();
      } catch (err) {
        setModal({ 
          show: true, 
          title: '批次導入失敗', 
          message: err.message || '伺服器內部發生未知錯誤，請檢查資料欄位或是否重複。' 
        });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // ==================== 頁碼計算輔助 (主清單, 限制顯示最多三頁) ====================
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalRecords / 10);
    if (totalPages <= 1) return [1];
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ==================== 子清單頁碼輔助 (限制顯示最多三頁) ====================
  const getSubPageNumbers = () => {
    const totalPages = Math.ceil(subTotal / 5);
    if (totalPages <= 1) return [1];

    let startPage = Math.max(1, subPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    const pages = [];
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
        <div className="col-lg-4 d-flex align-items-center">
          <input type="date" className="form-control me-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span className="me-2">至</span>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
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

      {/* 數據表格 */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2"><i className="bi bi-hourglass-split"></i> 資料載入中...</p>
        </div>
      ) : dataList.length === 0 ? (
        <div className="alert alert-warning text-center">目前沒有巡檢紀錄</div>
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

      {/* 主清單分頁器 */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="badge bg-info text-dark" style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>
          顯示第 {totalRecords === 0 ? 0 : (currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalRecords)} 筆，共 {totalRecords} 筆
        </span>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
            </li>
            {getPageNumbers().map(num => (
              <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(num)}>{num}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === Math.ceil(totalRecords / 10) || totalRecords === 0 ? 'disabled' : ''}`}>
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
                  {/* 第一列：日期、時間、工單編號 (含 Autocomplete 推薦下拉選單) */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">日期</label>
                      <input type="date" className="form-control form-control-sm" required value={ipqcForm.date} onChange={e => setIpqcForm({ ...ipqcForm, date: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">時間</label>
                      <input type="time" className="form-control form-control-sm" required value={ipqcForm.time} onChange={e => setIpqcForm({ ...ipqcForm, time: e.target.value })} />
                    </div>
                    
                    {/* 製令工單欄位 + 模糊補全建議框 */}
                    <div className="col-md-4 position-relative" ref={suggestionRef}>
                      <label className="form-label fw-bold d-flex justify-content-between">
                        製令工單
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('order', '工單資料庫')}></i>
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        required 
                        placeholder="鍵入關鍵字模糊補全..." 
                        value={ipqcForm.order_number} 
                        onChange={e => handleOrderChange(e.target.value)}
                        onFocus={() => { if (orderSuggestions.length > 0) setShowSuggestions(true); }}
                        autoComplete="off"
                      />
                      
                      {/* 渲染 Autocomplete 模糊清單 */}
                      {showSuggestions && (
                        <div className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto', top: '100%' }}>
                          {orderSuggestions.map(order => (
                            <button
                              key={order._id}
                              type="button"
                              className="list-group-item list-group-item-action text-start p-2 small"
                              onClick={() => selectOrder(order)}
                            >
                              <div><strong>工單：{order.order_number}</strong></div>
                              <div className="text-muted" style={{ fontSize: '11px' }}>
                                品號：{order.product_number} | {order.product_name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 第二列：品號、品名、數量 (自動聯動並支援手動微調) */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">品號 (自動聯動)</label>
                      <input type="text" className="form-control form-control-sm bg-light" required value={ipqcForm.product_number} onChange={e => setIpqcForm({ ...ipqcForm, product_number: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">品名 (自動聯動)</label>
                      <input type="text" className="form-control form-control-sm bg-light" required value={ipqcForm.product_name} onChange={e => setIpqcForm({ ...ipqcForm, product_name: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">數量</label>
                      <input type="number" className="form-control form-control-sm" required value={ipqcForm.quantity} onChange={e => setIpqcForm({ ...ipqcForm, quantity: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>

                  {/* 第三列：規格、版次 (自動聯動) */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold d-flex justify-content-between">
                        規格 (自動聯動)
                        <i className="bi bi-plus-circle text-primary cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => openSubModule('spec', '圖面規格資料庫')}></i>
                      </label>
                      <input type="text" className="form-control form-control-sm bg-light" value={ipqcForm.spec} onChange={e => setIpqcForm({ ...ipqcForm, spec: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">版次 (自動聯動)</label>
                      <input type="text" className="form-control form-control-sm bg-light" value={ipqcForm.draw_ver} onChange={e => setIpqcForm({ ...ipqcForm, draw_ver: e.target.value })} />
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

                  <div className="mb-3">
                    <label className="form-label fw-bold">不良狀況描述</label>
                    <textarea className="form-control form-control-sm" rows="2" value={ipqcForm.defect_status} onChange={e => setIpqcForm({ ...ipqcForm, defect_status: e.target.value })}></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">現場處置措施</label>
                    <textarea className="form-control form-control-sm" rows="2" value={ipqcForm.handling_measures} onChange={e => setIpqcForm({ ...ipqcForm, handling_measures: e.target.value })}></textarea>
                  </div>

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
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">分類名稱</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.defect_type || ''} onChange={e => setSubForm({...subForm, defect_type: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">描述</label>
                        <input type="text" className="form-control form-control-sm" value={subForm.description || ''} onChange={e => setSubForm({...subForm, description: e.target.value})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'order' && (
                    <>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">製令工單</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.order_number || ''} onChange={e => setSubForm({...subForm, order_number: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">品號</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_number || ''} onChange={e => setSubForm({...subForm, product_number: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">品名</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_name || ''} onChange={e => setSubForm({...subForm, product_name: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">工單數量</label>
                        <input type="number" className="form-control form-control-sm" required value={subForm.quantity || 0} onChange={e => setSubForm({...subForm, quantity: parseInt(e.target.value)})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'operator' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">姓名</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.name || ''} onChange={e => setSubForm({...subForm, name: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">部門</label>
                        <input type="text" className="form-control form-control-sm" placeholder="如：正義廠品管課" required value={subForm.department || ''} onChange={e => setSubForm({...subForm, department: e.target.value})} />
                      </div>
                    </>
                  )}
                  {subModal.type === 'spec' && (
                    <>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">關聯品號</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.product_number || ''} onChange={e => setSubForm({...subForm, product_number: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">規格尺寸</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.spec || ''} onChange={e => setSubForm({...subForm, spec: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">工程圖版次</label>
                        <input type="text" className="form-control form-control-sm" required value={subForm.version || ''} onChange={e => setSubForm({...subForm, version: e.target.value})} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">檢驗工時</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="form-control form-control-sm" 
                          placeholder="小數兩位"
                          required 
                          value={subForm.inspec_time || ''} 
                          onChange={e => setSubForm({...subForm, inspec_time: parseFloat(e.target.value)})} 
                        />
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

                {/* 子項目操作控制欄 */}
                <div className="row g-2 mb-3 align-items-center">
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="在目前子清單中模糊搜尋..."
                      value={subSearch}
                      onChange={e => {
                        setSubSearch(e.target.value);
                        setSubPage(1);
                        loadSubList(subModal.type, 1, e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-sm-6 text-sm-end text-start mt-2 mt-sm-0">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={handleSubExport}
                    >
                      <i className="bi bi-file-earmark-arrow-up me-1"></i>匯出備份
                    </button>
                    <label className="btn btn-sm btn-outline-secondary mb-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-file-earmark-arrow-down me-1"></i>匯入 Excel
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        style={{ display: 'none' }} 
                        onChange={handleSubImport} 
                      />
                    </label>
                  </div>
                </div>

                <table className="table table-sm table-bordered align-middle text-center mb-0">
                  <thead className="table-light">
                    <tr>
                      {subModal.type === 'defect' && <><th>分類名稱</th><th>描述說明</th></>}
                      {subModal.type === 'order' && <><th>製令工單</th><th>關聯品號</th><th>名稱規格</th><th>數量</th></>}
                      {subModal.type === 'operator' && <><th>姓名</th><th>隸屬部門</th></>}
                      {subModal.type === 'spec' && <><th>關聯品號</th><th>規格尺寸</th><th>工程圖版次</th><th>檢驗工時</th></>}
                      <th>操作項目</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subList.map(item => (
                      <tr key={item._id}>
                        {subModal.type === 'defect' && <><td>{item.defect_type}</td><td>{item.description}</td></>}
                        {subModal.type === 'order' && <><td>{item.order_number}</td><td>{item.product_number}</td><td>{item.product_name}</td><td>{item.quantity}</td></>}
                        {subModal.type === 'operator' && <><td>{item.name}</td><td>{item.department}</td></>}
                        {subModal.type === 'spec' && <><td>{item.product_number}</td><td>{item.spec}</td><td>{item.version}</td><td>{item.inspec_time ? Number(item.inspec_time).toFixed(2) : '0.00'}</td></>}
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

                {/* 子清單分頁器 */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="badge bg-secondary text-white" style={{ fontSize: '0.85rem' }}>
                    顯示第 {subTotal === 0 ? 0 : (subPage - 1) * 5 + 1}-{Math.min(subPage * 5, subTotal)} 筆，共 {subTotal} 筆
                  </span>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${subPage === 1 ? 'disabled' : ''}`}>
                        <button type="button" className="page-link" onClick={() => {
                          setSubPage(1);
                          loadSubList(subModal.type, 1, subSearch);
                        }}>«</button>
                      </li>
                      {getSubPageNumbers().map(num => (
                        <li key={num} className={`page-item ${subPage === num ? 'active' : ''}`}>
                          <button type="button" className="page-link" onClick={() => {
                            setSubPage(num);
                            loadSubList(subModal.type, num, subSearch);
                          }}>{num}</button>
                        </li>
                      ))}
                      <li className={`page-item ${subPage === Math.ceil(subTotal / 5) || subTotal === 0 ? 'disabled' : ''}`}>
                        <button type="button" className="page-link" onClick={() => {
                          const maxPage = Math.ceil(subTotal / 5);
                          setSubPage(maxPage);
                          loadSubList(subModal.type, maxPage, subSearch);
                        }}>»</button>
                      </li>
                    </ul>
                  </nav>
                </div>

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
      {/* 詢問確認防護 */}
      <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm({ ...confirm, show: false })} />
    </div>
  );
};

export default IpqcPage;