import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<HomePage/>}></Route>
        <Route path = "/login" element = {<LoginPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;