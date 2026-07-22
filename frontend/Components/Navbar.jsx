import Mark from './Mark'
function Navbar({ navigate }) {
return <header className="navbar">
  <button className="brand" onClick={() => navigate('/')} aria-label="Go to Linklet home">
    <Mark />
    <span>Linklet</span>
  </button>
  <nav aria-label="Account navigation">
    <button className="text-button" onClick={() => navigate('/login')}>Login</button>
    <button className="button button-small" onClick={() => navigate('/signup')}>Sign up</button>
  </nav>
</header>
}
export default Navbar
