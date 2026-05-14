import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AfterLoginPage from './pages/AfterLogin';
import ProfilePage from './pages/Profile';
import ComplaintPage from './pages/ComplaintPage';
import BookDetail from './pages/BookDetail';
import { Book } from 'lucide-react';

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
        <Route path = "/books/:bookId" element = {<BookDetail/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;