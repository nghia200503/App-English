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
      {/* </Suspense> */}
    </>
  )
};

export default App;
