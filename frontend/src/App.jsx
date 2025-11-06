import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
const Learning = React.lazy(() => import("./pages/Learning/Learning.jsx"));
const Vocabulary = React.lazy(() => import("./pages/User/Vocabulary.jsx"));
const Flashcard = React.lazy(() => import("./pages/User/Flashcard.jsx"));
const AdminHome = React.lazy(() => import("./pages/Admin/AdminHome.jsx"));
const UserList = React.lazy(() => import("./pages/Admin/UserList.jsx"));
const UserAdd = React.lazy(() => import("./pages/Admin/UserAdd.jsx"));
const UserUpdate = React.lazy(() => import("./pages/Admin/UserUpdate.jsx"));
const TopicList = React.lazy(() => import("./pages/Admin/TopicList.jsx"));
const TopicAdd = React.lazy(() => import("./pages/Admin/TopicAdd.jsx"));
const TopicUpdate = React.lazy(() => import("./pages/Admin/TopicUpdate.jsx"));
const WordList = React.lazy(() => import("./pages/Admin/WordList.jsx"));
const WordAdd = React.lazy(() => import("./pages/Admin/WordAdd.jsx"));
const WordAddBulk = React.lazy(() => import("./pages/Admin/WordAddBulk.jsx"));
const WordUpdate = React.lazy(() => import("./pages/Admin/WordUpdate.jsx"));
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
