import { useCallback, useEffect, useState } from "react"
import { supabase } from "./supabase"

const COMPANY_NAME = "Arrowsmith Rubber Surfacing"
const PRICING_URL = "https://www.rubaroc.com/"
const FORM_SUBMIT_URL = "https://formsubmit.co/Arrowsmithrubber@gmail.com"
const LOGO_IMAGE = "/logo/arrowsmith-rubber-surfacing-pdf.png?v=orange-aqua-tight"
const HERO_IMAGE = "/Images/sections/premium-rubber-surfacing.png"
const SERVICE_IMAGE = "/Images/sections/our-service-entrance.png"
const PRODUCTS_IMAGE = "/Images/sections/products-recreation.png"
const ASSISTANT_IMAGE = "/Images/sections/customer-assistant-detail.png"
const ASSISTANT_CHAT_ICON = "/Images/assistant-chat-icon.png?v=orange-bot-transparent"
const PRICING_IMAGE = "/Images/sections/pricing-plaza.png"
const DETAIL_IMAGE = ASSISTANT_IMAGE

const theme = {
  page: "#09131b",
  panel: "rgba(13, 24, 32, 0.94)",
  panelStrong: "rgba(6, 15, 23, 0.97)",
  nav: "rgba(7, 16, 24, 0.96)",
  text: "#fffbe8",
  muted: "#d7ded8",
  dim: "#93a0a2",
  border: "rgba(255, 103, 54, 0.36)",
  accent: "#f26132",
  accentDark: "#c9432e",
  teal: "#65bdd4",
  tealDark: "#2a7e92",
  amber: "#ff8f2f",
}

const services = [
  {
    title: "Rubber Surfacing",
    description:
      "Durable, slip-resistant rubber surfacing installed for residential, commercial, recreation, and specialty spaces across Vancouver Island.",
  },
]

const products = [
  {
    name: "Pool Decks",
    description:
      "Comfortable rubber surfaces that stay practical around water, bare feet, and everyday pool traffic.",
  },
  {
    name: "Entrances & Pathways",
    description:
      "Clean, resilient surfaces for walkways, entry points, ramps, and high-use transitions.",
  },
  {
    name: "Athletic Facilities",
    description:
      "Impact-friendly surfacing for training areas, courts, gyms, and multipurpose sport spaces.",
  },
  {
    name: "Play Spaces",
    description:
      "Soft, playful surfaces designed for safer movement, color options, and long-lasting use.",
  },
  {
    name: "Splash Pads",
    description:
      "Water-ready rubber surfacing built for grip, drainage, comfort, and bright custom designs.",
  },
  {
    name: "Special Projects",
    description:
      "Custom rubber surfacing for unique layouts, repairs, resurfacing, feature areas, and creative builds.",
  },
]

const builtInGalleryImages = [
  {
    name: "Brown driveway rubber surfacing",
    url: "/Images/gallery/driveway-brown-rubber-surfacing.png",
  },
  {
    name: "Grey driveway rubber surfacing",
    url: "/Images/gallery/driveway-grey-rubber-surfacing.png",
  },
  {
    name: "Garage apron rubber surfacing",
    url: "/Images/gallery/garage-rubber-surfacing.png",
  },
  {
    name: "Modern driveway rubber surfacing",
    url: "/Images/gallery/modern-driveway-rubber-surfacing.png",
  },
  {
    name: "Pool deck rubber surfacing",
    url: "/Images/gallery/pool-deck-rubber-surfacing.png",
  },
  {
    name: "Pathway rubber surfacing",
    url: "/Images/gallery/pathway-rubber-surfacing.png",
  },
]

const initialChatMessages = [
  {
    role: "assistant",
    content:
      "Hi! Ask me about rubber surfacing options, project planning, or getting a quote.",
  },
]

const sectionBackground = (image = DETAIL_IMAGE, opacity = 0.82) =>
  `linear-gradient(135deg, rgba(7,16,24,${opacity}), rgba(16,28,36,${opacity})), url('${image}')`

const cardStyle = {
  background: theme.panel,
  border: `1px solid ${theme.border}`,
  borderRadius: "8px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
}

const primaryButtonStyle = {
  padding: "18px 35px",
  fontSize: "18px",
  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 14px 34px rgba(242,97,50,0.3)",
}

export default function App() {
  const [galleryImages, setGalleryImages] = useState([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [isChatSending, setIsChatSending] = useState(false)
  const displayGalleryImages = [...builtInGalleryImages, ...galleryImages]

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

  async function handleChatSubmit(event) {
    event.preventDefault()

    const content = chatInput.trim()

    if (!content || isChatSending) return

    const nextMessages = [
      ...chatMessages,
      {
        role: "user",
        content,
      },
    ]

    setChatMessages(nextMessages)
    setChatInput("")
    setIsChatSending(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "The assistant could not respond.")
      }

      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ])
    } catch (error) {
      console.log(error)
      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I could not connect to the assistant right now. Please call or text (250) 607-7411, or send a quote request through the contact form.",
        },
      ])
    } finally {
      setIsChatSending(false)
    }
  }

  return (
    <div
      style={{
        background: theme.page,
        color: theme.text,
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 50px",
          background: theme.nav,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${theme.border}`,
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            minWidth: 0,
          }}
        >
          <img
            src={LOGO_IMAGE}
            alt={`${COMPANY_NAME} logo`}
            style={{
              height: "100px",
              width: "100px",
              objectFit: "contain",
              background: "white",
              padding: "2px",
              borderRadius: "10px",
              boxShadow: "0 14px 32px rgba(0,0,0,0.34)",
            }}
          />

          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              letterSpacing: "0",
              lineHeight: "1.1",
              color: theme.text,
            }}
          >
            {COMPANY_NAME}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["Home", "#"],
            ["Services", "#services"],
            ["Gallery", "#gallery"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{ color: theme.text, textDecoration: "none" }}
            >
              {label}
            </a>
          ))}

          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.amber, textDecoration: "none" }}
          >
            Pricing
          </a>

          <a
            href="#contact"
            style={{ color: theme.text, textDecoration: "none" }}
          >
            Contact
          </a>
        </div>
      </nav>

      <section
        style={{
          minHeight: "88vh",
          backgroundImage:
            `linear-gradient(110deg, rgba(5,12,18,0.88), rgba(5,12,18,0.42), rgba(92,35,24,0.78)), url('${HERO_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "980px",
          }}
        >
          <p
            style={{
              color: theme.teal,
              fontSize: "15px",
              fontWeight: "bold",
              letterSpacing: "0.14em",
              marginBottom: "18px",
              textTransform: "uppercase",
            }}
          >
            Poured rubber surfacing
          </p>

          <h1
            style={{
              fontSize: "clamp(50px, 8vw, 104px)",
              marginBottom: "22px",
              lineHeight: "0.98",
              fontWeight: "900",
              textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            Premium
            <br />
            Rubber
            <br />
            Surfacing
          </h1>

          <p
            style={{
              fontSize: "clamp(18px, 2.4vw, 24px)",
              marginBottom: "35px",
              color: theme.muted,
              lineHeight: "1.6",
            }}
          >
            Pool decks, entrances, pathways, athletic facilities, play spaces,
            splash pads, and custom rubber surfacing projects across Vancouver
            Island.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  .scrollIntoView({ behavior: "smooth" })
              }
              style={primaryButtonStyle}
            >
              Get A Free Quote
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("gallery")
                  .scrollIntoView({ behavior: "smooth" })
              }
              style={{
                padding: "18px 35px",
                fontSize: "18px",
                background: "rgba(255,251,232,0.08)",
                border: `2px solid ${theme.teal}`,
                borderRadius: "8px",
                color: theme.text,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Our Work
            </button>
          </div>
        </div>
      </section>

      <section
        id="services"
        style={{
          padding: "100px 50px",
          backgroundImage: sectionBackground(SERVICE_IMAGE, 0.86),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "50px", marginBottom: "20px" }}>
            Our Service
          </h2>

          <p style={{ color: theme.muted, fontSize: "20px" }}>
            Rubber surfacing built for safety, comfort, color, and long-term
            durability.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 760px)",
            justifyContent: "center",
            gap: "25px",
          }}
        >
          {services.map((service) => (
            <div
              key={service.title}
              style={{
                ...cardStyle,
                padding: "35px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "32px",
                  marginBottom: "15px",
                  color: theme.amber,
                }}
              >
                {service.title}
              </h3>

              <p
                style={{
                  color: theme.muted,
                  lineHeight: "1.7",
                  fontSize: "18px",
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="products"
        style={{
          padding: "100px 50px",
          backgroundImage: sectionBackground(PRODUCTS_IMAGE, 0.86),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "50px", marginBottom: "20px" }}>
            Rubber Surfacing Products
          </h2>

          <p style={{ color: theme.muted, fontSize: "20px" }}>
            Practical applications for homes, businesses, recreation spaces, and
            custom builds.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.name}
              style={{
                ...cardStyle,
                padding: "30px",
                borderTop: `4px solid ${theme.teal}`,
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  marginBottom: "15px",
                  color: theme.text,
                }}
              >
                {product.name}
              </h3>

              <p
                style={{
                  color: theme.muted,
                  lineHeight: "1.7",
                }}
              >
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="gallery"
        style={{
          padding: "120px 50px",
          backgroundImage: sectionBackground(HERO_IMAGE, 0.84),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "70px" }}>
          <h2
            style={{
              fontSize: "56px",
              marginBottom: "20px",
            }}
          >
            See Our Work
          </h2>

          <p
            style={{
              color: theme.muted,
              fontSize: "22px",
            }}
          >
            Explore rubber surfacing projects and recent installs.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 440px))",
            justifyContent: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          {displayGalleryImages.map((image, index) => (
            <div
              key={`${image.name}-${index}`}
              style={{
                width: "min(100%, 440px)",
                aspectRatio: "1 / 1",
                backgroundImage: `url(${image.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "8px",
                overflow: "hidden",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 18px 42px rgba(0,0,0,0.42)",
              }}
              role="img"
              aria-label={image.name}
            />
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "100px 50px",
          backgroundImage: sectionBackground(ASSISTANT_IMAGE, 0.88),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "56px",
            marginBottom: "25px",
          }}
        >
          Customer Assistant
        </h2>

        <p
          style={{
            color: theme.muted,
            fontSize: "22px",
            maxWidth: "850px",
            margin: "0 auto 50px auto",
            lineHeight: "1.7",
          }}
        >
          Get quick answers about rubber surfacing options, project planning,
          product applications, color ideas, and quote requests.
        </p>

        <div
          style={{
            ...cardStyle,
            maxWidth: "900px",
            margin: "0 auto",
            padding: "50px",
          }}
        >
          <h3
            style={{
              fontSize: "34px",
              marginBottom: "20px",
              color: theme.teal,
            }}
          >
            Live Support Available
          </h3>

          <p
            style={{
              color: theme.muted,
              fontSize: "18px",
              lineHeight: "1.7",
            }}
          >
            Use the chat bubble in the bottom corner of the website to ask
            questions, request a quote, compare project options, or get guidance
            for your rubber surfacing project.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "100px 50px",
          backgroundImage: sectionBackground(PRICING_IMAGE, 0.9),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "50px", marginBottom: "20px" }}>
            Pricing
          </h2>

          <p
            style={{
              color: theme.muted,
              fontSize: "20px",
              lineHeight: "1.7",
              marginBottom: "35px",
            }}
          >
            For rubber surfacing pricing, product details, and Rubaroc system
            information, visit Rubaroc directly.
          </p>

          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...primaryButtonStyle,
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            View Pricing
          </a>
        </div>
      </section>

      <section
        id="contact"
        style={{
          padding: "100px 50px",
          background: `linear-gradient(135deg, #0a2530, #101820 58%, #2a1712)`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "50px", marginBottom: "20px" }}>
            Request A Quote
          </h2>

          <p style={{ color: theme.muted, fontSize: "20px" }}>
            Let&apos;s build the right rubber surface for your space.
          </p>
        </div>

        <form
          action={FORM_SUBMIT_URL}
          method="POST"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "700px",
            margin: "0 auto",
            ...cardStyle,
            padding: "40px",
          }}
        >
          <input
            type="hidden"
            name="_subject"
            value={`${COMPANY_NAME} Quote Request`}
          />
          <input type="hidden" name="_template" value="table" />
          <input type="text" name="_honey" style={{ display: "none" }} />

          {[
            ["text", "name", "Name"],
            ["tel", "phone", "Phone Number"],
            ["email", "email", "Email Address"],
          ].map(([type, name, placeholder]) => (
            <input
              key={name}
              type={type}
              name={name}
              placeholder={placeholder}
              required
              style={{
                padding: "18px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                background: "#fffbe8",
                color: "#101820",
                fontSize: "16px",
              }}
            />
          ))}

          <textarea
            name="message"
            placeholder="Tell us about your project"
            required
            style={{
              padding: "18px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              background: "#fffbe8",
              color: "#101820",
              minHeight: "180px",
              fontSize: "16px",
            }}
          />

          <button type="submit" style={primaryButtonStyle}>
            Send Message
          </button>
        </form>
      </section>

      <footer
        style={{
          padding: "80px 20px 46px",
          background: "#071018",
          textAlign: "center",
          borderTop: `1px solid ${theme.border}`,
          position: "relative",
        }}
      >
        <h2
          style={{
            color: theme.teal,
            fontSize: "38px",
            marginBottom: "20px",
          }}
        >
          Contact Us
        </h2>

        <p
          style={{
            color: theme.muted,
            fontSize: "20px",
            marginBottom: "10px",
          }}
        >
          Call or Text Anytime
        </p>

        <a
          href="tel:2506077411"
          style={{
            color: theme.text,
            fontSize: "32px",
            fontWeight: "bold",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "28px",
          }}
        >
          (250) 607-7411
        </a>

        <p
          style={{
            color: theme.dim,
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Copyright &copy; 2026 by Arrowsmith Rubber Surfacing. All rights
          reserved.
        </p>

        <a
          href="/admin"
          style={{
            position: "absolute",
            left: "14px",
            bottom: "10px",
            color: "#768385",
            fontSize: "10px",
            lineHeight: 1,
            textDecoration: "none",
          }}
        >
          Admin login
        </a>
      </footer>

      <div
        style={{
          position: "fixed",
          right: "18px",
          bottom: "18px",
          zIndex: 2000,
          fontFamily: "Arial, sans-serif",
        }}
      >
        {isChatOpen && (
          <div
            style={{
              width: "min(360px, calc(100vw - 36px))",
              height: "min(520px, calc(100vh - 36px))",
              background: theme.panelStrong,
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.48)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <strong>Arrowsmith Assistant</strong>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close assistant"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.14)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {chatMessages.map((message, index) => {
                const isUser = message.role === "user"

                return (
                  <div
                    key={`${message.role}-${index}`}
                    style={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "86%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: isUser ? theme.accent : "rgba(255,251,232,0.1)",
                      color: isUser ? "white" : theme.text,
                      border: isUser ? "none" : `1px solid ${theme.border}`,
                      lineHeight: "1.45",
                      fontSize: "14px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.content}
                  </div>
                )
              })}

              {isChatSending && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    color: theme.muted,
                    fontSize: "14px",
                  }}
                >
                  Typing...
                </div>
              )}
            </div>

            <form
              onSubmit={handleChatSubmit}
              style={{
                display: "flex",
                gap: "8px",
                padding: "12px",
                borderTop: `1px solid ${theme.border}`,
                background: "rgba(7,16,24,0.96)",
              }}
            >
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask a question"
                aria-label="Ask the assistant a question"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: "#fffbe8",
                  color: "#101820",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
                style={{
                  padding: "0 16px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    isChatSending || !chatInput.trim()
                      ? "rgba(147,160,162,0.45)"
                      : theme.teal,
                  color: "#071018",
                  fontWeight: "bold",
                  cursor:
                    isChatSending || !chatInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsChatOpen((current) => !current)}
          aria-label="Open assistant"
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            boxShadow: "0 18px 38px rgba(0,0,0,0.42)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: 0,
          }}
        >
          <img
            src={ASSISTANT_CHAT_ICON}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
              borderRadius: "50%",
            }}
          />
        </button>
      </div>
    </div>
  )
}
