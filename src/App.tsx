import { Routes, Route } from "react-router-dom";

import DetailPage from "./components/DetailPage";
import Header from "./components/Header";
import PageForm from "./components/PageForm";
import Home from "./components/Home";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pageForm" element={<PageForm />} />
        <Route path="/pages/:id" element={<DetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
