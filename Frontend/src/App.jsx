import Hero from './pages/Hero.jsx'
import Navbar from './components/Navbar.jsx'
import Trending from './components/Trending.jsx'

function App() {
  return (
    <>
    <div className="bg-black min-h-screen">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>

      <div id='trending'>
        <Trending />
      </div>
    </div>
      
      
    </>
  )
}

export default App