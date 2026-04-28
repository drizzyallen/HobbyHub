import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Feed from './pages/Feed'
import Account from './pages/Account'
import CreatePost from './pages/CreatePost'
import PostPage from './pages/PostPage'
import './App.css'

function Home() {
  return (
    <main>
      <h1>Budgie Hub</h1>
      <nav>
        <Link to="/account" className="buttonInterface">Your Account</Link>
        <Link to="/feed" className="buttonInterface">Your Daily Dose of Birds</Link>
        <Link to="/create-post" className="buttonInterface">Create Post</Link>
      </nav>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/account" element={<Account />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
