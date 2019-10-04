import React from 'react';
import './styles/bootstrap-reboot.min.css';
import './styles/main.scss';
import './styles/css/all.css';

import VN from './components/VN';

function App() {
  return (
    <React.Fragment>
        <header>
            Maszyna von Neumanna
        </header>

        <VN />

        <footer>

        </footer>
    </React.Fragment>
  );
}

export default App;
