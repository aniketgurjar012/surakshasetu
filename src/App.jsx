import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Verify from "./pages/Verify";

import Worker from "./pages/Worker";
import Module from "./pages/worker/Module";
import ARTraining from "./pages/worker/ARTraining";
import Assessment from "./pages/worker/Assessment";
import Result from "./pages/worker/Result";
import Certificate from "./pages/worker/Certificate";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Workers from "./pages/admin/Workers";
import Modules from "./pages/admin/Modules";
import Questions from "./pages/admin/Questions";
import QuestionEditor from "./pages/admin/QuestionEditor";
import Assessments from "./pages/admin/Assessments";
import AssessmentDetails from "./pages/admin/AssessmentDetails";
import Certificates from "./pages/admin/Certificates";
import CertificateDetails from "./pages/admin/CertificateDetails";
import Compliance from "./pages/admin/Compliance";

import ProtectedRoute from "./components/ProtectedRoute";

function WorkerOnly({children}){
  return (
    <ProtectedRoute role="worker">
      {children}
    </ProtectedRoute>
  );
}

function AdminOnly({children}){
  return (
    <ProtectedRoute role="admin">
      {children}
    </ProtectedRoute>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home/>}
        />

        <Route
          path="/auth"
          element={<Auth/>}
        />

        <Route
          path="/verify"
          element={<Verify/>}
        />

        <Route
          path="/worker"
          element={
            <WorkerOnly>
              <Worker/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/module/:id"
          element={
            <WorkerOnly>
              <Module/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/ar/:id"
          element={
            <WorkerOnly>
              <ARTraining/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/assessment/:id"
          element={
            <WorkerOnly>
              <Assessment/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/result/:submissionId"
          element={
            <WorkerOnly>
              <Result/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/certificate/create/:submissionId"
          element={
            <WorkerOnly>
              <Certificate/>
            </WorkerOnly>
          }
        />

        <Route
          path="/worker/certificate/:certificateId"
          element={
            <WorkerOnly>
              <Certificate/>
            </WorkerOnly>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminDashboard/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/workers"
          element={
            <AdminOnly>
              <Workers/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/modules"
          element={
            <AdminOnly>
              <Modules/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/questions"
          element={
            <AdminOnly>
              <Questions/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/questions/new"
          element={
            <AdminOnly>
              <QuestionEditor/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/questions/:id/edit"
          element={
            <AdminOnly>
              <QuestionEditor/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/assessments"
          element={
            <AdminOnly>
              <Assessments/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/assessments/:id"
          element={
            <AdminOnly>
              <AssessmentDetails/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/certificates"
          element={
            <AdminOnly>
              <Certificates/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/certificates/:id"
          element={
            <AdminOnly>
              <CertificateDetails/>
            </AdminOnly>
          }
        />

        <Route
          path="/admin/compliance"
          element={
            <AdminOnly>
              <Compliance/>
            </AdminOnly>
          }
        />

        <Route
          path="*"
          element={<Home/>}
        />

      </Routes>
    </BrowserRouter>
  );
}