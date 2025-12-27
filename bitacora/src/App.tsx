import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DailyEnergy from './pages/DailyEnergy'
import ConsultantEnergy from './pages/ConsultantEnergy'
import Spreads from './pages/Spreads'
import Rituals from './pages/Rituals'
import { ClientList } from './pages/ClientList'
import { ClientProfile } from './pages/ClientProfile'
import { Agenda } from './pages/Agenda'
import { Finance } from './pages/Finance'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/energy" element={<Layout><DailyEnergy /></Layout>} />
        <Route path="/consultant" element={<Layout><ConsultantEnergy /></Layout>} />
        <Route path="/spreads" element={<Layout><Spreads /></Layout>} />
        <Route path="/rituals" element={<Layout><Rituals /></Layout>} />
        <Route path="/clients" element={<Layout><ClientList /></Layout>} />
        <Route path="/clients/:id" element={<Layout><ClientProfile /></Layout>} />
        <Route path="/agenda" element={<Layout><Agenda /></Layout>} />
        <Route path="/finance" element={<Layout><Finance /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App
