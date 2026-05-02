import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AfterLoginPage from './pages/AfterLogin';
import ProfilePage from './pages/Profile';
import ComplaintPage from './pages/ComplaintPage';

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<HomePage/>}></Route>
        <Route path = "/login" element = {<LoginPage/>}></Route>
        <Route path = "/signup" element = {<SignupPage/>}></Route>
        <Route path = "/afterlogin" element = {<AfterLoginPage/>}></Route>
        <Route path = "/profile" element = {<ProfilePage/>}></Route>
        <Route path = "/complaint" element = {<ComplaintPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;