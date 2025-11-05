import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Learning from "./pages/Learning/Learning.jsx";
import Register from "./pages/Register/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Toaster } from "sonner";
import Home from "./pages/Home/Home.jsx";
import AdminHome from "./pages/Admin/AdminHome.jsx";
import UserList from "./pages/Admin/UserList.jsx";
import TopicList from "./pages/Admin/TopicList.jsx";
import WordList from "./pages/Admin/WordList.jsx";
import WordAdd from "./pages/Admin/WordAdd.jsx";
import TopicAdd from "./pages/Admin/TopicAdd.jsx";
import TopicUpdate from "./pages/Admin/TopicUpdate.jsx";
import UserAdd from "./pages/Admin/UserAdd.jsx";
import UserUpdate from "./pages/Admin/UserUpdate.jsx";
import Vocabulary from "./pages/User/Vocabulary.jsx";
import WordUpdate from "./pages/Admin/WordUpdate.jsx";
import Flashcard from "./pages/User/Flashcard.jsx";
import WordAddBulk from "./pages/Admin/WordAddBulk.jsx";

function App() {
  return (
    <>
      <Toaster richColors />
      <Routes>

        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protect routes */}
        <Route element={<ProtectedRoute />}>
          {/* Trang user */}
          <Route path='/learn' element={<Learning />} />
          <Route path='/vocabulary' element={<Vocabulary />} />
          <Route path='/vocabulary/flashcard' element={<Flashcard />} />
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
    </>
  )
};

export default App;
