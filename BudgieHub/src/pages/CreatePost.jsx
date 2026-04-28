import { useState } from "react";
import supabase from "../dataBase";

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image || !caption) {
      setMessage("Please provide both an image and a caption.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(`public/${Date.now()}_${image.name}`, image);
        
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('posts')
        .insert([{ image_url: uploadData.path, caption: caption }]);
        
      if (error) throw error;

      setMessage("Post created successfully!");
      setCaption("");
      setImage(null);
      document.getElementById("image").value = "";
    } catch (error) {
      console.error("Error creating post:", error);
      setMessage("Failed to create post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <p>Create a new budgie post.</p>

      {message && <p style={{ fontWeight: 'bold', color: message.includes("Failed") ? "red" : "green" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '15px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="caption">Caption:</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your budgie..."
            rows="4"
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="buttonInterface"
          style={{ padding: '10px', cursor: loading ? 'not-allowed' : 'pointer', width: 'fit-content' }}
        >
          {loading ? "Creating..." : "Submit Post"}
        </button>
      </form>
    </div>
  )
}
