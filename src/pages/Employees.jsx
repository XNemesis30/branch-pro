import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";
import DeleteBtn from "../components/DeleteBtn";
function EmployeeModal({ emp, onClose, onSave }) {
  const [form, setForm] = useState(emp || {
    name: "", nid: "", dob: "", joiningDate: "", bkash: "",
    salary: "", designation: "", department: "", address: "", emergencyContact: "",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.salary || !form.joiningDate || !form.bkash) {
      setError("Name, Salary, Joining Date, and bKash are required.");
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{emp ? "Edit Employee" : "Add Employee"}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Employee full name" />
            </div>
            <div className="form-group">
              <label>NID Number</label>
              <input value={form.nid} onChange={e => set("nid", e.target.value)} placeholder="National ID" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Joining Date *</label>
              <input type="date" value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>bKash Number *</label>
              <input value={form.bkash} onChange={e => set("bkash", e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div className="form-group">
              <label>Initial Salary (৳) *</label>
              <input type="number" value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="Monthly salary" />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input value={form.designation} onChange={e => set("designation", e.target.value)} placeholder="Job title" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={e => set("department", e.target.value)} placeholder="Department" />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)} placeholder="Phone number" />
            </div>
            <div className="form-group full">
              <label>Address</label>
              <textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Home address" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>
            {emp ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IncrementModal({ emp, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply Salary Increment — {emp.name}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Current Salary</label>
              <input value={`৳${parseFloat(emp.salary).toLocaleString()}`} disabled />
            </div>
            <div className="form-group">
              <label>Increment Amount (৳)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 2000" autoFocus />
            </div>
            <div className="form-group">
              <label>New Salary</label>
              <input value={amount ? `৳${(parseFloat(emp.salary) + parseFloat(amount || 0)).toLocaleString()}` : ""} disabled />
            </div>
            <div className="form-group">
              <label>Effective Date</label>
              <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for increment" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={() => { if (amount) { onSave({ employeeId: emp.id, incrementAmount: amount, effectiveDate, notes }); onClose(); } }}>
            Apply Increment
          </button>
        </div>
      </div>
    </div>
  );
}

function RehireModal({ emp, onClose, onSave }) {
  const [salary, setSalary] = useState(emp.salary);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rehire — {emp.name}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>New Salary (৳)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(emp.id, salary); onClose(); }}>Confirm Rehire</button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, addEmployee, updateEmployee, fireEmployee, rehireEmployee, applyIncrement, salaryRecords, caps, deleteEmployee } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [incrementEmp, setIncrementEmp] = useState(null);
  const [rehireEmp, setRehireEmp] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const filtered = employees.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.nid.includes(search) || e.bkash.includes(search);
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getEmpSalaryHistory = (empId) =>
    salaryRecords.filter((r) => r.employeeId === empId)
      .sort((a, b) => (parseInt(b.year) * 12 + parseInt(b.month)) - (parseInt(a.year) * 12 + parseInt(a.month)));

  const statusBadge = (s) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <p>Manage all employee records and profiles</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="Search by name, ID, NID, bKash..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "140px" }}>
            <option>All</option>
            <option>Active</option>
            <option>Fired</option>
            <option>Rehired</option>
          </select>
        </div>
        <div className="toolbar-right">
          {caps.canEditEmployees && (
            <button className="btn btn-primary" onClick={() => { setEditEmp(null); setShowModal(true); }}>
              + Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>bKash</th>
                <th>Salary</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><p>No employees found</p></div></td></tr>
              )}
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td><span className="mono" style={{ color: "var(--accent)", fontSize: "12px" }}>{emp.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{emp.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.designation}</div>
                  </td>
                  <td><span className="mono" style={{ fontSize: "12px" }}>{emp.bkash}</span></td>
                  <td><span className="amount">{formatCurrency(emp.salary)}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{emp.department || "—"}</td>
                  <td>{statusBadge(emp.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEmp(emp)}>View</button>
                      {caps.canEditEmployees && <button className="btn btn-secondary btn-sm" onClick={() => { setEditEmp(emp); setShowModal(true); }}>Edit</button>}
                      {caps.canApplyIncrement && <button className="btn btn-success btn-sm" onClick={() => setIncrementEmp(emp)}>↑ Inc</button>}
                      {caps.canFireRehire && (emp.status !== "Fired"
                        ? <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Fire ${emp.name}?`)) fireEmployee(emp.id); }}>Fire</button>
                        : <button className="btn btn-secondary btn-sm" onClick={() => setRehireEmp(emp)}>Rehire</button>
                      )}
                      <DeleteBtn onDelete={() => deleteEmployee(emp.id)} label={`employee ${emp.name}`}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Profile Modal */}
      {selectedEmp && (
        <div className="modal-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="modal" style={{ maxWidth: "720px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedEmp.name}</h3>
                <span className="mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{selectedEmp.id}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {statusBadge(selectedEmp.status)}
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEmp(null)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                {[
                  ["NID", selectedEmp.nid || "—"],
                  ["Date of Birth", selectedEmp.dob || "—"],
                  ["Joining Date", selectedEmp.joiningDate],
                  ["bKash", selectedEmp.bkash],
                  ["Current Salary", formatCurrency(selectedEmp.salary)],
                  ["Designation", selectedEmp.designation || "—"],
                  ["Department", selectedEmp.department || "—"],
                  ["Emergency Contact", selectedEmp.emergencyContact || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "3px" }}>{k}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="section-title">Salary History</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Month</th><th>Base</th><th>Bonus</th><th>Loan Ded.</th><th>Payable</th><th>Withdrawn</th><th>Balance</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {getEmpSalaryHistory(selectedEmp.id).slice(0, 6).map((r) => (
                      <tr key={r.id}>
                        <td className="mono" style={{ fontSize: "12px" }}>{r.month}/{r.year}</td>
                        <td className="amount">{formatCurrency(r.baseSalary)}</td>
                        <td className="amount" style={{ color: "var(--accent)" }}>{formatCurrency(r.bonus)}</td>
                        <td className="amount amount-negative">{formatCurrency(r.loanDeduction)}</td>
                        <td className="amount" style={{ fontWeight: 600 }}>{formatCurrency(r.totalPayable)}</td>
                        <td className="amount amount-positive">{formatCurrency(r.totalWithdrawn)}</td>
                        <td className="amount" style={{ color: parseFloat(r.balance) > 0 ? "var(--warning)" : "var(--success)" }}>{formatCurrency(r.balance)}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {getEmpSalaryHistory(selectedEmp.id).length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>No salary records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <EmployeeModal
          emp={editEmp}
          onClose={() => { setShowModal(false); setEditEmp(null); }}
          onSave={(form) => editEmp ? updateEmployee(editEmp.id, form) : addEmployee(form)}
        />
      )}

      {incrementEmp && (
        <IncrementModal
          emp={incrementEmp}
          onClose={() => setIncrementEmp(null)}
          onSave={applyIncrement}
        />
      )}

      {rehireEmp && (
        <RehireModal
          emp={rehireEmp}
          onClose={() => setRehireEmp(null)}
          onSave={rehireEmployee}
        />
      )}
    </div>
  );
}
