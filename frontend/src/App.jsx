import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
import Learning from "./pages/Learning/Learning.jsx";
import Vocabulary from "./pages/User/Vocabulary.jsx";
import Flashcard from "./pages/User/Flashcard.jsx";
import AdminHome from "./pages/Admin/AdminHome.jsx";
import UserList from "./pages/Admin/UserList.jsx";
import UserAdd from "./pages/Admin/UserAdd.jsx";
import UserUpdate from "./pages/Admin/UserUpdate.jsx";
import TopicList from "./pages/Admin/TopicList.jsx";
import TopicAdd from "./pages/Admin/TopicAdd.jsx";
import TopicUpdate from "./pages/Admin/TopicUpdate.jsx";
import WordList from "./pages/Admin/WordList.jsx";
import WordAdd from "./pages/Admin/WordAdd.jsx";
import WordAddBulk from "./pages/Admin/WordAddBulk.jsx";
import WordUpdate from "./pages/Admin/WordUpdate.jsx";
import { Toaster } from "sonner";
import Quiz from "./pages/User/Quiz.jsx";
import QuizResult from "./pages/User/QuizResult.jsx";
import Spell from "./pages/User/Spell.jsx";
import SpellResult from "./pages/User/SpellResult.jsx";
import Listen from "./pages/User/Listen.jsx";
import ListenResult from "./pages/User/ListenResult.jsx";
import Profile from "./pages/User/Profile.jsx";
import ProgressPage from "./pages/User/ProgressPage.jsx";
import FlashcardResult from "./pages/User/FlashcardResult.jsx";

// Component Loading
// const PageLoader = () => (
//   <div className="flex h-screen items-center justify-center">Đang tải trang...</div>
// );

function App() {
  return (
    <>
      <Toaster richColors />
      {/* <Suspense fallback={<PageLoader />}> */}
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protect routes */}
          <Route element={<ProtectedRoute />}>
            {/* Trang user */}
            <Route path='/learn' element={<Learning />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/vocabulary' element={<Vocabulary />} />
            <Route path='/vocabulary/flashcard' element={<Flashcard />} />
            <Route path='/vocabulary/flashcard/result' element={<FlashcardResult />} />
            <Route path='/vocabulary/quiz' element={<Quiz />} />
            <Route path='/vocabulary/quiz/result' element={<QuizResult />} />
            <Route path='/vocabulary/spell' element={<Spell />} />
            <Route path='/vocabulary/spell/result' element={<SpellResult />} />
            <Route path='/vocabulary/listen' element={<Listen />} />
            <Route path='/vocabulary/listen/result' element={<ListenResult />} />
            <Route path='/progress' element={<ProgressPage />} />
          </Route>



          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            {/* Trang admin */}
            {/* Dashboard */}
            <Route path='/admin' element={<AdminHome />} />
            {/* Quản lý user */}
            <Route path='/admin/user-list' element={<UserList />} />
            <Route path='/admin/user-add' element={<UserAdd />} />
            <Route path='/admin/user-update/:id' element={<UserUpdate />} />
            {/* Quản lý topic */}
            <Route path='/admin/topic-list' element={<TopicList />} />
            <Route path='/admin/topic-add' element={<TopicAdd />} />
            <Route path='/admin/topic-update/:id' element={<TopicUpdate />} />
            {/* Quản lý topic */}
            <Route path='/admin/word-list' element={<WordList />} />
            <Route path='/admin/word-add' element={<WordAdd />} />
            <Route path='/admin/word-add-bulk' element={<WordAddBulk />} />
            <Route path='/admin/word-update/:id' element={<WordUpdate />} />

          </Route>

        </Routes>
      {/* </Suspense> */}
    </>
  )
};

export default App;
