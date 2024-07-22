
import './App.css';
import Questions from './pages/user/quizQuestions';
import EditQuiz from './pages/admin/quizForm';
import Home from './pages/user/home';
import Login from './pages/login';
import Signup from './pages/signup';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './pages/profile';
import QuizIntro from './pages/user/quizIntro';
import ThankYou from './pages/user/thankYou';
import Unauthorized from './pages/unauthorized';
import DashboardPage from './pages/admin/dashboardPage';
import UsersPage from './pages/admin/usersPage';
import AdminQuizzespage from './pages/admin/quizzesPage';
import Addquizpage from './pages/admin/quizPage';
import DateCalendarServerRequest from './components/calendar';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/calendar' element={<DateCalendarServerRequest></DateCalendarServerRequest>}></Route>
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
          <Route path='/quizzes' element={<AdminQuizzespage></AdminQuizzespage>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
