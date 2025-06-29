import { CarGame } from './components/CarGame';
import './App.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="App">
      <CarGame />
      <ToastContainer newestOnTop />
    </div>
  );
}

export default App;
