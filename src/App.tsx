import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import './styles/Auth.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import Layout from './components/Layout'
import TeamDetails from './pages/TeamDetails'
import Decisions from './pages/Decisions'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { AnimatePresence } from 'framer-motion'
import AnimatedPage from './components/AnimatedPage'
import ScrollAnimatedSection from './components/ScrollAnimatedSection'
import DecisionDetails from './pages/DecisionDetails'
import AuthHashRouter from './components/AuthHashRouter'
import JoinTeam from './pages/JoinTeam'

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <AuthHashRouter />
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/signin" element={<AnimatedPage><SignIn /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><SignUp /></AnimatedPage>} />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
        <Route path="/reset-password" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
        <Route path="/join/:teamId" element={<AnimatedPage><JoinTeam /></AnimatedPage>} />
        <Route path="/" element={
          <AnimatedPage>
            <div className="app">
              <Header />
              <Hero />
              <ScrollAnimatedSection>
                <Features />
              </ScrollAnimatedSection>
              <ScrollAnimatedSection>
                <Testimonials />
              </ScrollAnimatedSection>
              <ScrollAnimatedSection>
                <CTA />
              </ScrollAnimatedSection>
              <Footer />
            </div>
          </AnimatedPage>
        } />

        {/* Authenticated routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team/:teamId" element={<TeamDetails />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/decision/:decisionId" element={<DecisionDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
