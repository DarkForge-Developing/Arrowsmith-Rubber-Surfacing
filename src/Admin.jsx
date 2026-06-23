import { useCallback, useEffect, useState } from "react"
import { supabase } from "./supabase"

const COMPANY_NAME = "Arrowsmith Rubber Surfacing"
const theme = {
  page: "#0f141a",
  panel: "#121921",
  panelSoft: "#1b2633",
  text: "#f8fbff",
  muted: "#c8d4df",
  border: "#285f99",
  accent: "#075ca8",
  teal: "#6aa7e8",
}

export default function Admin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [galleryImages, setGalleryImages] = useState([])

  const fetchImages = useCallback(async () => {
    const { data, error } = await supabase.storage.from("gallery").list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      console.log(error)
      return
    }

    const imageUrls = data
      .filter((file) => file.name && !file.name.endsWith("/"))
      .map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from("gallery").getPublicUrl(file.name)

        return {
          name: file.name,
          url: publicUrl,
        }
      })

    setGalleryImages(imageUrls)
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  async function handleLogin(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Login failed")
      return
    }

    setLoggedIn(true)
  }

  function handleFiles(files) {
    const images = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (images.length === 0) {
      alert("Please choose image files.")
      return
    }

    setSelectedFiles(images)
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      alert("Please choose or drop image files.")
      return
    }

    setUploading(true)

    for (const [index, file] of selectedFiles.entries()) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const fileName = `${Date.now()}-${index}-${safeName}`

      const { error } = await supabase.storage
        .from("gallery")
        .upload(fileName, file)

      if (error) {
        console.log(error)
        setUploading(false)
        alert(`Upload failed for ${file.name}`)
        return
      }
    }

    setUploading(false)
    alert("Upload successful!")
    setSelectedFiles([])
    fetchImages()
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function deleteImage(imageName) {
    const confirmDelete = window.confirm("Delete this image permanently?")

    if (!confirmDelete) return

    const { error } = await supabase.storage.from("gallery").remove([imageName])

    if (error) {
      console.log(error)
      alert("Delete failed")
      return
    }

    fetchImages()
  }

  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.page,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: theme.panel,
            padding: "40px",
            borderRadius: "8px",
            width: "350px",
            maxWidth: "100%",
            boxShadow: "0 0 40px rgba(0,0,0,0.5)",
          }}
        >
          <h1
            style={{
              color: theme.text,
              marginBottom: "25px",
            }}
          >
            Admin Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "none",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "none",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: theme.accent,
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.page,
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          color: theme.teal,
          marginBottom: "20px",
          fontSize: "42px",
        }}
      >
        {COMPANY_NAME} Admin Panel
      </h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: theme.accent,
            color: "white",
            padding: "14px 22px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          View Live Website
        </a>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            setLoggedIn(false)
          }}
          style={{
            background: "#ef4444",
            color: "white",
            padding: "14px 22px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: theme.panel,
            padding: "30px",
            borderRadius: "8px",
          }}
        >
          <h2
            style={{
              color: theme.teal,
              marginBottom: "20px",
            }}
          >
            Upload Gallery Photos
          </h2>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: isDragging
                ? `2px solid ${theme.teal}`
                : `2px dashed ${theme.border}`,
              background: isDragging ? "rgba(106,167,232,0.14)" : theme.panelSoft,
              borderRadius: "8px",
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: theme.text,
              textAlign: "center",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <strong style={{ fontSize: "20px", marginBottom: "10px" }}>
              Drag and drop photos here
            </strong>
            <span style={{ color: theme.muted, lineHeight: "1.6" }}>
              Gallery images display in the old website format: 440 x 440
              square cards.
            </span>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{
              marginBottom: "20px",
              color: "white",
              width: "100%",
            }}
          />

          {selectedFiles.length > 0 && (
            <div
              style={{
                color: theme.muted,
                background: theme.panelSoft,
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "20px",
                lineHeight: "1.7",
                fontSize: "14px",
              }}
            >
              Selected: {selectedFiles.map((file) => file.name).join(", ")}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "15px",
              background: uploading ? "#003f73" : theme.accent,
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: uploading ? "wait" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload To Gallery"}
          </button>
        </div>

        <div
          style={{
            background: theme.panel,
            padding: "30px",
            borderRadius: "8px",
          }}
        >
          <h2
            style={{
              color: theme.teal,
              marginBottom: "20px",
            }}
          >
            Quick Admin Notes
          </h2>

          <div
            style={{
              color: theme.muted,
              lineHeight: "2",
            }}
          >
            Uploaded images automatically appear on the website gallery.
            <br />
            Changes are live instantly for customers.
            <br />
            Delete old projects anytime below.
            <br />
            Avoid uploading blurry or duplicate images.
            <br />
            Best image size: 1200 x 1200 or larger for clean square crops.
          </div>
        </div>
      </div>

      <div
        style={{
          background: theme.panel,
          padding: "30px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              color: theme.teal,
            }}
          >
            Current Website Gallery
          </h2>

          <div
            style={{
              background: theme.panelSoft,
              color: theme.muted,
              padding: "10px 15px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {galleryImages.length} Images
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 440px))",
            justifyContent: "center",
            gap: "25px",
          }}
        >
          {galleryImages.map((image) => (
            <div
              key={image.name}
              style={{
                background: theme.panelSoft,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={image.url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  padding: "15px",
                }}
              >
                <button
                  onClick={() => deleteImage(image.name)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Delete Image
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
