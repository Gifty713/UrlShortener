import Navbar from './Navbar'
import UrlShortenerForm from './UrlShortenerForm'
import Footer from './Footer'
function Home({ navigate }) {
return <>
  <Navbar navigate={navigate} />
  <main className="hero-section">
    <div className="eyebrow">SIMPLE LINKS, BIGGER POSSIBILITIES</div>
    <h1>Make every link<br />
      <em>count.</em>
    </h1>
    {/* <p className="hero-copy">Create clean, shareable links in seconds. Built for the moments you want to measure.</p> */}
    <UrlShortenerForm navigate={navigate} />
  </main>
  <Footer/>
</>
}
export default Home;
