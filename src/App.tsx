import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientList from "@/pages/PatientList";
import VisitDetail from "@/pages/VisitDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PatientList />} />
        <Route path="/patient/:id" element={<VisitDetail />} />
        <Route path="*" element={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
              <p className="text-slate-500">页面不存在</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}
