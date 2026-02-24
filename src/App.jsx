import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import HrLayout from "./layouts/HrLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeePayroll from "./pages/EmployeePayroll";
import EmployeeBranch from "./pages/EmployeeBranch";
import EmployeeHolidays from "./pages/EmployeeHolidays";
import EmployeeViolations from "./pages/EmployeeViolations";
import EmployeeWorkingDays from "./pages/EmployeeWorkingDays";

// Admin Pages
import BranchList from "./pages/admin/BranchList";
import UserList from "./pages/admin/UserList";
import ShiftList from "./pages/admin/ShiftList";
import AttendanceMonitor from "./pages/admin/AttendanceMonitor";
import Payroll from "./pages/admin/Payroll";
// Reports removed as per request
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminViolations from "./pages/admin/AdminViolations";
import AdminHolidays from './pages/admin/AdminHolidays';
import AdminWorkingDays from './pages/admin/AdminWorkingDays';
import AdminProfile from './pages/admin/AdminProfile';
import AdminFakeCheckins from './pages/admin/AdminFakeCheckins';
import Probation from './pages/admin/Probation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding/step/:stepNumber" element={<Onboarding />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="branches" element={<BranchList />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<AdminUserDetails />} />
              <Route path="shifts" element={<ShiftList />} />
              <Route path="attendance" element={<AttendanceMonitor />} />
              <Route path="violations" element={<AdminViolations />} />
              <Route path="holidays" element={<AdminHolidays />} />
              <Route path="working-days" element={<AdminWorkingDays />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="fake-checkins" element={<AdminFakeCheckins />} />
              <Route path="probation" element={<Probation />} />
              <Route path="profile" element={<AdminProfile />} />
              {/* <Route path="reports" element={<Reports />} /> */}
            </Route>
          </Route>

          {/* HR Routes */}
          <Route path="/hr" element={<RoleProtectedRoute allowedRoles={["HR"]} />}>
            <Route element={<HrLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboard />} />
            </Route>
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<RoleProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route element={<ManagerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<div>Manager Dashboard</div>} />
            </Route>
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<RoleProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route element={<EmployeeLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="violations" element={<EmployeeViolations />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="payroll" element={<EmployeePayroll />} />
              <Route path="branch" element={<EmployeeBranch />} />
              <Route path="working-days" element={<EmployeeWorkingDays />} />
              <Route path="holidays" element={<EmployeeHolidays />} />
            </Route>
          </Route>

          {/* Default Redirect */}


          <Route path="/unauthorized" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1><p>You do not have permission to view this page.</p></div>} />
          <Route path="*" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold">404 Not Found</h1></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
