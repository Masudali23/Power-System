import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ContentTopic from './pages/ContentTopic';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/topic/intro" replace />} />
          <Route path="topic/:topicId" element={<ContentTopic />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
