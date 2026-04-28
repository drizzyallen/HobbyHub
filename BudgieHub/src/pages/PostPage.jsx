import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../dataBase";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
      } else if (data) {
        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(data.image);
        setPost({ ...data, imageUrl: urlData.publicUrl });
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleUpvote = async () => {
    const newUpvotes = (post.upvotes || 0) + 1;
    
    // Update locally instantly
    setPost({ ...post, upvotes: newUpvotes });

    // Save to database
    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newUpvotes })
      .eq("id", post.id);

    if (error) {
      console.error("Error updating upvotes:", error);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentObj = {
      id: Date.now(),
      text: newComment,
      date: new Date().toLocaleString()
    };
    
    setComments([...comments, commentObj]);
    setNewComment("");
  };

  const handleEditClick = () => {
    setEditTitle(post.Title || post.title || "");
    setEditCaption(post.caption || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    // Save to Supabase
    const { error } = await supabase
      .from("posts")
      .update({ Title: editTitle, caption: editCaption })
      .eq("id", post.id);

    if (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    } else {
      // Update local state
      setPost({ ...post, Title: editTitle, caption: editCaption });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    } else {
      navigate('/feed'); // Redirect to feed after deletion
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading post...</p>;
  if (!post) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Post not found!</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="buttonInterface"
        style={{ alignSelf: 'flex-start', padding: '10px 20px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Back to Feed
      </button>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '600px'
      }}>
        <img 
          src={post.imageUrl} 
          alt={post.Title || post.title || post.caption} 
          style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} 
        />
        <div style={{ padding: '20px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              <textarea 
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', width: '100%', boxSizing: 'border-box', minHeight: '100px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveEdit} style={{ padding: '8px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                <button onClick={() => setIsEditing(false)} style={{ padding: '8px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{post.Title || post.title}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleEditClick} style={{ padding: '6px 12px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '20px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={handleDelete} style={{ padding: '6px 12px', cursor: 'pointer', border: 'none', backgroundColor: '#dc3545', color: '#fff', borderRadius: '20px', fontWeight: 'bold' }}>Delete</button>
                </div>
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '18px', lineHeight: '1.6', color: '#555' }}>{post.caption}</p>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <button 
              onClick={handleUpvote}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f0f0f0', 
                border: '1px solid #ccc', 
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              👍 {post.upvotes || 0} Upvotes
            </button>
            <small style={{ color: '#888' }}>{new Date(post.created_at).toLocaleString()}</small>
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Comments</h3>
            
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={{ 
                  flex: 1, 
                  padding: '10px 15px', 
                  borderRadius: '20px', 
                  border: '1px solid #ccc',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Post
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {comments.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>{comment.text}</p>
                    <small style={{ color: '#888', fontSize: '12px' }}>{comment.date}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
