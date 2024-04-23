import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/:roomId' element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App;
