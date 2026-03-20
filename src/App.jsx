import { AppProvider, useApp } from "./context/AppContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Salary from "./pages/Salary";
import Loans from "./pages/Loans";
import Bonuses from "./pages/Bonuses";
import Reports from "./pages/Reports";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import CashLedger from "./pages/CashLedger";
import BankLedger from "./pages/BankLedger";
import Cheques from "./pages/Cheques";
import Deposits from "./pages/Deposits";
import MotherCompany from "./pages/MotherCompany";
import Sidebar from "./components/Sidebar";
import SetupChecker from "./components/SetupChecker";
import "./App.css";

function AppInner() {
  const { isLoggedIn, currentPage, setCurrentPage } = useApp();
  if (!isLoggedIn) return <Login />;
  const pages = {
    dashboard: <Dashboard />,
    employees: <Employees />,
    salary: <Salary />,
    loans: <Loans />,
    bonuses: <Bonuses />,
    income: <Income />,
    expenses: <Expenses />,
    cash: <CashLedger />,
    bank: <BankLedger />,
    cheques: <Cheques />,
    deposits: <Deposits />,
    mothercompany: <MotherCompany />,
    reports: <Reports />,
  };
  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">{pages[currentPage] || <Dashboard />}</main>
      <SetupChecker />
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
