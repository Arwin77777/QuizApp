
import './App.css';
import Questions from './pages/Questions';
import Dashboard from './pages/dashboard';
import EditQuiz from './pages/editQuiz';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Users from './pages/users';
import Profile from './pages/profile';
import QuizIntro from './pages/quizIntro';
import ThankYou from './pages/thankYou';
import Sidebar from './components/sidebar';
import Unauthorized from './pages/unauthorized';
import AddQuiz from './pages/addQuiz';
import Handwriting from './components/handwriting';
import DashboardPage from './pages/dashboardPage';
import UsersPage from './pages/userspage';
import AdminQuizzes from './pages/adminQuizzes';
import AdminQuizzespage from './pages/adminQuizzespage';
import Addquizpage from './pages/addquizpage';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes> 
          <Route path='/' element={<Login></Login>}></Route>
        <Route path='/signup' element={<Signup></Signup>}></Route>
          <Route path='/dashboard' element={<DashboardPage></DashboardPage>}></Route>
          <Route path='/home' element={<Home></Home>}></Route>
          <Route path='quiz/:quizId' element={<EditQuiz></EditQuiz>}></Route>
          <Route path='takeQuiz/:quizId' element={<Questions></Questions>}></Route>
          <Route path='/users' element={<UsersPage></UsersPage>}></Route>
          <Route path='/profile/:userId' element={<Profile></Profile>}></Route>
          <Route path='/quizIntro' element={<QuizIntro></QuizIntro>}></Route>
          <Route path='/thankyou/:quizId' element={<ThankYou></ThankYou>}></Route>
          <Route path='/unauthorized' element={<Unauthorized></Unauthorized>}></Route>
          <Route path='/addQuiz' element={<Addquizpage></Addquizpage>}></Route>
          <Route path='handwriting' element={<Handwriting></Handwriting>}></Route>
          <Route path='/quizzes' element={<AdminQuizzespage></AdminQuizzespage>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
