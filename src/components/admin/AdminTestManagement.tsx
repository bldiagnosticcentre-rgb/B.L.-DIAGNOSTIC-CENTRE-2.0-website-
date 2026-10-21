import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Tag,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TEST_CATEGORIES } from '../../data/initialData';
import { DiagnosticTest } from '../../types';

export const AdminTestManagement: React.FC = () => {
  const { tests, updateTest, addCustomTest } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Tests');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'official_only' | 'verified_only' | 'pending_only'>('all');

  // Edit test inline / modal
  const [editingTest, setEditingTest] = useState<DiagnosticTest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // New test form state
  const [newTest, setNewTest] = useState({
    code: '',
    shortName: '',
    name: '',
    category: 'Blood Tests',
    method: 'Automated Analyzer',
    sample: '2 ml Plain Blood (Serum)',
    instructions: 'Fasting sample preferred.',
    description: 'Routine diagnostic investigation.',
    reportingTime: 'Same Day',
    generalPrice: 300 as number | null,
    corporatePrice: 240,
    homeCollectionAvailable: true,
    active: true,
    verified: true,
    verificationNote: '',
    isOfficialCatalogue: false
  });

  const filteredTests = tests.filter(t => {
    const matchesCat = categoryFilter === 'All Tests' || t.category === categoryFilter;

    let matchesVerification = true;
    if (verificationFilter === 'official_only') matchesVerification = Boolean(t.isOfficialCatalogue);
    if (verificationFilter === 'verified_only') matchesVerification = Boolean((t.verified ?? true) && t.generalPrice !== null && t.generalPrice > 0);
    if (verificationFilter === 'pending_only') matchesVerification = Boolean(t.verified === false || t.generalPrice === null);

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      t.code.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q));

    return matchesCat && matchesVerification && matchesSearch;
  });

  const pendingCount = tests.filter(t => !t.verified || t.generalPrice === null).length;
  const officialCount = tests.filter(t => t.isOfficialCatalogue).length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    updateTest(editingTest.id, {
      name: editingTest.name.trim(),
      shortName: editingTest.shortName?.trim(),
      category: editingTest.category,
      generalPrice: editingTest.generalPrice !== null && editingTest.generalPrice !== undefined ? Number(editingTest.generalPrice) : null,
      corporatePrice: Number(editingTest.corporatePrice || 0),
      reportingTime: editingTest.reportingTime,
      instructions: editingTest.instructions,
      description: editingTest.description,
      verified: editingTest.verified,
      verificationNote: editingTest.verificationNote,
      active: editingTest.active
    });
    setEditingTest(null);
  };

  const handleQuickVerify = (test: DiagnosticTest) => {
    // If test has no price, prompt or set default
    if (test.generalPrice === null) {
      setEditingTest(test);
      return;
    }
    updateTest(test.id, {
      verified: true,
      active: true,
      verificationNote: 'Confirmed and verified by laboratory administrator'
    });
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.name || !newTest.code) return;
    addCustomTest({
      ...newTest,
      generalPrice: newTest.generalPrice !== null ? Number(newTest.generalPrice) : null,
      corporatePrice: Number(newTest.corporatePrice)
    });
    setShowAddModal(false);
    setNewTest({
      code: '',
      shortName: '',
      name: '',
      category: 'Blood Tests',
      method: 'Automated Analyzer',
      sample: '2 ml Plain Blood (Serum)',
      instructions: 'Fasting sample preferred.',
      description: 'Routine diagnostic investigation.',
      reportingTime: 'Same Day',
      generalPrice: 300,
      corporatePrice: 240,
      homeCollectionAvailable: true,
      active: true,
      verified: true,
      verificationNote: '',
      isOfficialCatalogue: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Diagnostic Test Catalogue Manager</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
              B.L. Diagnostic Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Handwritten Rate Card & Comprehensive Diagnostic Database ({officialCount} official tests · {pendingCount} pending verification)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Test</span>
          </button>
        </div>
      </div>

      {/* Filter and View Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setVerificationFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            verificationFilter === 'all'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Database Tests ({tests.length})
        </button>

        <button
          onClick={() => setVerificationFilter('official_only')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            verificationFilter === 'official_only'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Official 25 Tests List ({officialCount})</span>
        </button>

        <button
          onClick={() => setVerificationFilter('pending_only')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            verificationFilter === 'pending_only'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Verification ({pendingCount})</span>
        </button>

        <button
          onClick={() => setVerificationFilter('verified_only')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            verificationFilter === 'verified_only'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified & Published Online</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by test name, short name (e.g. CBC, CRP, LFT), or code..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          {TEST_CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-3 w-16">S.No</th>
                <th className="py-3 px-3">Code / Abbr</th>
                <th className="py-3 px-4">Official Test Name & Category</th>
                <th className="py-3 px-4">Sample Required</th>
                <th className="py-3 px-4">Price (INR)</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Online Booking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTests.map((test, index) => {
                const isPending = !test.verified || test.generalPrice === null;
                return (
                  <tr
                    key={test.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isPending ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      {test.serialNo ? (
                        <span className="text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          #{test.serialNo}
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-950 block">
                        {test.shortName || test.code}
                      </span>
                      {test.shortName && test.shortName !== test.code && (
                        <span className="text-[10px] text-slate-400 font-mono">{test.code}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{test.name}</span>
                        {test.isOfficialCatalogue && (
                          <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                            Official
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {test.category} {test.method ? `· ${test.method}` : ''}
                      </span>
                      {isPending && test.verificationNote && (
                        <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                          Note: {test.verificationNote}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {test.sample || 'Standard specimen'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {test.generalPrice !== null && test.generalPrice !== undefined ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm">₹{test.generalPrice.toLocaleString('en-IN')}</span>
                          {!test.verified && (
                            <span className="text-[10px] text-amber-600 font-semibold">*Unverified</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-sans font-semibold">
                          Price not provided
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {test.verified && test.generalPrice !== null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateTest(test.id, { active: !test.active })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          test.active
                            ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Toggle public visibility"
                      >
                        {test.active ? 'PUBLISHED' : 'HIDDEN'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && test.generalPrice !== null && (
                          <button
                            onClick={() => handleQuickVerify(test)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                            title="Confirm and verify this test"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => setEditingTest(test)}
                          className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit Details & Price"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Test Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Edit Official Test Details & Pricing</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {editingTest.shortName || editingTest.code} · ID: {editingTest.id}
                </p>
              </div>
              <button
                onClick={() => setEditingTest(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTest.name}
                    onChange={e => setEditingTest({ ...editingTest, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Abbreviation</label>
                  <input
                    type="text"
                    value={editingTest.shortName || ''}
                    onChange={e => setEditingTest({ ...editingTest, shortName: e.target.value })}
                    placeholder="e.g. CBC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={editingTest.category}
                    onChange={e => setEditingTest({ ...editingTest, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {TEST_CATEGORIES.filter(c => c !== 'All Tests').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">General Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editingTest.generalPrice === null ? '' : editingTest.generalPrice}
                    onChange={e =>
                      setEditingTest({
                        ...editingTest,
                        generalPrice: e.target.value === '' ? null : Number(e.target.value)
                      })
                    }
                    placeholder="Leave blank if not provided"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Verification & Publication toggles */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-xs block">Quality & Verification Controls</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">Verification Status</span>
                    <span className="text-[10px] text-slate-500">
                      Confirmed entries are eligible for immediate online booking
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingTest({ ...editingTest, verified: !editingTest.verified })}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      editingTest.verified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {editingTest.verified ? 'VERIFIED' : 'PENDING'}
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Verification Note / Internal Remark</label>
                  <input
                    type="text"
                    value={editingTest.verificationNote || ''}
                    onChange={e => setEditingTest({ ...editingTest, verificationNote: e.target.value })}
                    placeholder="e.g. Price confirmed from laboratory master tariff"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 text-xs">Public Catalogue Visibility</span>
                  <button
                    type="button"
                    onClick={() => setEditingTest({ ...editingTest, active: !editingTest.active })}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                      editingTest.active ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {editingTest.active ? 'PUBLISHED' : 'DRAFT / HIDDEN'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Preparation Instructions</label>
                <textarea
                  rows={2}
                  value={editingTest.instructions || ''}
                  onChange={e => setEditingTest({ ...editingTest, instructions: e.target.value })}
                  placeholder="e.g. 10-12 hours overnight fasting recommended"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Diagnostic Test</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={newTest.name}
                    onChange={e => setNewTest({ ...newTest, name: e.target.value })}
                    placeholder="e.g. Thyroid Stimulating Hormone (TSH)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Code / Abbr *</label>
                  <input
                    type="text"
                    required
                    value={newTest.code}
                    onChange={e => setNewTest({ ...newTest, code: e.target.value.toUpperCase(), shortName: e.target.value.toUpperCase() })}
                    placeholder="e.g. TSH"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={newTest.category}
                    onChange={e => setNewTest({ ...newTest, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {TEST_CATEGORIES.filter(c => c !== 'All Tests').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={newTest.generalPrice === null ? '' : newTest.generalPrice}
                    onChange={e =>
                      setNewTest({
                        ...newTest,
                        generalPrice: e.target.value === '' ? null : Number(e.target.value)
                      })
                    }
                    placeholder="300"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Sample / Specimen Required</label>
                <input
                  type="text"
                  value={newTest.sample}
                  onChange={e => setNewTest({ ...newTest, sample: e.target.value })}
                  placeholder="e.g. 2 ml Serum"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Create Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
