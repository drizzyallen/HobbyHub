import { useState, useEffect } from "react";
import supabase from "../dataBase";

export default function Account() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      // Get public URLs for the images
      const postsWithUrls = data.map(post => {
        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(post.image);
        return { ...post, imageUrl: urlData.publicUrl };
      });
      setPosts(postsWithUrls);
    }
    setLoading(false);
  };

  const handleUpvote = async (postId, currentUpvotes) => {
    const newUpvotes = (currentUpvotes || 0) + 1;
    
    // Update locally instantly
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, upvotes: newUpvotes } : post
    ));

    // Save to database
    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newUpvotes })
      .eq("id", postId);

    if (error) {
      console.error("Error updating upvotes:", error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const title = post.Title || post.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div>
      <h2>Your Account</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Your Posts</h3>
          
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '300px',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setSortBy('date')}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: sortBy === 'date' ? '#007bff' : '#f0f0f0', 
              color: sortBy === 'date' ? 'white' : 'black',
              border: '1px solid #ccc', 
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: sortBy === 'date' ? 'bold' : 'normal'
            }}
          >
            Newest First
          </button>
          <button 
            onClick={() => setSortBy('upvotes')}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: sortBy === 'upvotes' ? '#007bff' : '#f0f0f0', 
              color: sortBy === 'upvotes' ? 'white' : 'black',
              border: '1px solid #ccc', 
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: sortBy === 'upvotes' ? 'bold' : 'normal'
            }}
          >
            Most Upvotes
          </button>
        </div>
      </div>
      </div>
      
      {loading ? (
        <p>Loading posts...</p>
      ) : sortedPosts.length === 0 ? (
        <p>No posts match your search.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {sortedPosts.map(post => (
            <div key={post.id} style={{ 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={post.imageUrl} 
                alt={post.caption} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{post.Title || post.title}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{post.caption}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleUpvote(post.id, post.upvotes)}
                    style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #ccc', 
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    👍 {post.upvotes || 0}
                  </button>
                  <small style={{ color: '#666' }}>{new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
