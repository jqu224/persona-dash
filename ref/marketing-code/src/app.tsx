import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import WorkbenchPage from "@/pages/WorkbenchPage/WorkbenchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<WorkbenchPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
