import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Feed from './pages/Feed'
import Account from './pages/Account'
import CreatePost from './pages/CreatePost'
import SavedBirds from './pages/SavedBirds'
import './App.css'

function Home() {
  return (
    <main>
      <h1>Budgie Hub</h1>
      <p>A hub for all things budgies</p>
      <nav>
        <Link to="/account" className="buttonInterface">Your Account</Link>
        <Link to="/feed" className="buttonInterface">Your Daily Dose of Birds</Link>
        <Link to="/create-post" className="buttonInterface">Create Post</Link>
        <Link to="/saved-birds" className="buttonInterface">Saved Birds</Link>
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
        <Route path="/saved-birds" element={<SavedBirds />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
