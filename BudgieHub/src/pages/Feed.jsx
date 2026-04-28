import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../dataBase";

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
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

    // Save to Supabase Database
    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newUpvotes })
      .eq("id", postId);

    if (error) {
      console.error("Error updating upvotes in database:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Feed</h2>
      <p>This is the main feed with your daily dose of birds.</p>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found. Be the first to share a bird!</p>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '40px',
          marginTop: '20px',
          width: '100%',
          maxWidth: '600px'
        }}>
          {posts.map(post => (
            <div 
              key={post.id} 
              onClick={() => navigate(`/post/${post.id}`)}
              style={{ 
                border: '1px solid #ccc', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#fff', // ensures clean look if body has background
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={post.imageUrl} 
                alt={post.Title || post.title || post.caption} 
                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>{post.Title || post.title}</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '16px', lineHeight: '1.5', color: '#555' }}>{post.caption}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents click from bubbling up to the post card
                      handleUpvote(post.id, post.upvotes);
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #ccc', 
                      borderRadius: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 'bold'
                    }}
                  >
                    👍 {post.upvotes || 0} Upvotes
                  </button>
                  <small style={{ color: '#888' }}>{new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
