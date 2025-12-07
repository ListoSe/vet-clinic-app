import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import icon from '../../assets/icon.svg';
import './App.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
        <button type="button">
          <Link to="/serega-tupit">SEREGA TUPIT</Link>
        </button>
      </div>
    </div>
  );
}

function SeregaTupit() {
  return <div>SEREGA TUPIT</div>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/serega-tupit" element={<SeregaTupit />} />
      </Routes>
    </Router>
  );
}
