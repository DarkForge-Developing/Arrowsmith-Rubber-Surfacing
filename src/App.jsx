import { useCallback, useEffect, useState } from "react"
import { supabase } from "./supabase"

const COMPANY_NAME = "Oma Carpentry & Handyman Services"
const PHONE_DISPLAY = "(604) 698-7185"
const PHONE_HREF = "tel:+16046987185"
const FORM_SUBMIT_URL = "https://formsubmit.co/peterbain179@gmail.com"
const LOGO_IMAGE = "/oma/logo-light.png"
const LOGO_DARK_IMAGE = "/oma/logo-dark.png"
const HERO_IMAGE = "/oma/work-9.jpg"

const services = [
  {
    title: "Custom Carpentry",
    description:
      "Built-ins, shelving, storage solutions, benches, trim details, and one-off woodwork made to suit the space.",
  },
  {
    title: "Decks, Fences & Outdoor Builds",
    description:
      "Decking, railings, garden structures, sheds, exterior stairs, privacy screens, and weather-ready repairs.",
  },
  {
    title: "Interior Finishing",
    description:
      "Doors, casing, baseboards, flooring, feature walls, drywall repairs, painting touch-ups, and clean finish work.",
  },
  {
    title: "Handyman Services",
    description:
      "Practical home repairs, fixture installs, small renovations, patching, maintenance, and project punch lists.",
  },
]

const featuredProjects = [
  {
    title: "Cedar Studio Addition",
    image: "/oma/work-9.jpg",
    description: "A backyard studio build from layout and framing to siding, windows, and final exterior details.",
  },
  {
    title: "Decking & Rail Renewal",
    image: "/oma/work-3.jpg",
    description: "Warm wood decking paired with tidy railing work for a cleaner, safer outdoor living area.",
  },
  {
    title: "Interior Refresh",
    image: "/oma/work-4.jpg",
    description: "Flooring, trim, wall finishes, and built-in storage brought together for a finished room upgrade.",
  },
]

const builtInGalleryImages = [
  { name: "Backyard shed build", url: "/oma/work-1.jpg" },
  { name: "Hallway renovation before and after", url: "/oma/work-2.jpg" },
  { name: "Deck and railing project", url: "/oma/work-3.jpg" },
  { name: "Basement flooring and built-ins", url: "/oma/work-4.jpg" },
  { name: "Bathroom finishing work", url: "/oma/work-5.jpg" },
  { name: "Interior door and flooring installation", url: "/oma/work-6.jpg" },
  { name: "Exterior awning and entrance carpentry", url: "/oma/work-7.jpg" },
  { name: "Custom cabinet planning and build", url: "/oma/work-8.jpg" },
  { name: "Studio addition design and build", url: "/oma/work-9.jpg" },
  { name: "Hallway trim and doors", url: "/oma/work-10.jpg" },
]

const initialChatMessages = [
  {
    role: "assistant",
    content:
      "Hi! Tell me what needs building or fixing, and I can help you prepare a clear request for Oma Carpentry.",
  },
]

const navLinks = [
  ["Services", "#services"],
  ["Work", "#work"],
  ["Gallery", "#gallery"],
  ["Contact", "#contact"],
]

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
          content: `I could not connect to the assistant right now. Please call or text ${PHONE_DISPLAY}.`,
        },
      ])
    } finally {
      setIsChatSending(false)
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`${COMPANY_NAME} home`}>
          <img src={LOGO_IMAGE} alt={`${COMPANY_NAME} logo`} />
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          {navLinks.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <a className="nav-phone" href={PHONE_HREF}>
          {PHONE_DISPLAY}
        </a>
      </header>

      <main id="top">
        <section
          className="hero"
          style={{
            "--hero-image": `url('${HERO_IMAGE}')`,
          }}
        >
          <div className="hero-content">
            <p className="eyebrow">Fast, reliable, quality work.</p>
            <h1>
              <span>Oma Carpentry</span>
              <span>& Handyman</span>
              <span>Services</span>
            </h1>
            <p className="hero-copy">
              Carpentry, finishing, outdoor builds, repairs, and practical home
              improvements handled with clean workmanship and careful detail.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href={PHONE_HREF}>
                Call {PHONE_DISPLAY}
              </a>
              <a className="button button-secondary" href="#gallery">
                View Work
              </a>
            </div>
          </div>
        </section>

        <section className="intro-band" aria-label="Company highlights">
          <div>
            <strong>Carpentry</strong>
            <span>Custom woodwork, framing, repairs, and finish details.</span>
          </div>
          <div>
            <strong>Handyman Work</strong>
            <span>Useful fixes, installs, maintenance, and small renovations.</span>
          </div>
          <div>
            <strong>Local Service</strong>
            <span>Call Peter Bain directly at {PHONE_DISPLAY}.</span>
          </div>
        </section>

        <section id="services" className="section services-section">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>Built around the work homes actually need.</h2>
            <p>
              From a single repair to a multi-step renovation, Oma handles the
              practical details that make a space feel finished and dependable.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="section work-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Recent work</p>
              <h2>Clear upgrades, sturdy builds, tidy finishes.</h2>
            </div>
            <p>
              A mix of exterior carpentry, interior renovations, built-ins, and
              repair work from the attached project photos.
            </p>
          </div>

          <div className="featured-grid">
            {featuredProjects.map((project) => (
              <article className="feature-card" key={project.title}>
                <img src={project.image} alt={project.title} />
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="section gallery-section">
          <div className="section-heading">
            <p className="eyebrow">Gallery</p>
            <h2>Project photos</h2>
            <p>
              Sheds, decks, awnings, cabinets, flooring, doors, bathroom
              finishing, and interior refreshes.
            </p>
          </div>

          <div className="gallery-grid">
            {displayGalleryImages.map((image, index) => (
              <figure className="gallery-item" key={`${image.name}-${index}`}>
                <img src={image.url} alt={image.name} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-copy">
            <p className="eyebrow">Contact</p>
            <h2>Ready to talk through a project?</h2>
            <p>
              Call or text Oma Carpentry with the repair, build, or renovation
              you have in mind.
            </p>
            <a className="contact-phone" href={PHONE_HREF}>
              {PHONE_DISPLAY}
            </a>
          </div>

          <form className="contact-form" action={FORM_SUBMIT_URL} method="POST">
            <input
              type="hidden"
              name="_subject"
              value={`${COMPANY_NAME} Website Request`}
            />
            <input type="hidden" name="_template" value="table" />
            <input type="text" name="_honey" className="hidden-field" />

            <label>
              <span>Name</span>
              <input type="text" name="name" required />
            </label>

            <label>
              <span>Phone</span>
              <input type="tel" name="phone" required />
            </label>

            <label>
              <span>Email</span>
              <input type="email" name="email" required />
            </label>

            <label>
              <span>Project details</span>
              <textarea name="message" rows="6" required />
            </label>

            <button className="button button-primary" type="submit">
              Send Message
            </button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <img src={LOGO_DARK_IMAGE} alt={`${COMPANY_NAME} logo`} />
        <div>
          <strong>{COMPANY_NAME}</strong>
          <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
        </div>
        <p>Copyright &copy; 2026 Oma Carpentry. All rights reserved.</p>
        <a className="admin-link" href="/admin">
          Admin login
        </a>
      </footer>

      <div className="chat-widget">
        {isChatOpen && (
          <div className="chat-panel">
            <div className="chat-header">
              <strong>Oma Assistant</strong>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close assistant"
              >
                x
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((message, index) => {
                const isUser = message.role === "user"

                return (
                  <div
                    className={isUser ? "chat-message user" : "chat-message"}
                    key={`${message.role}-${index}`}
                  >
                    {message.content}
                  </div>
                )
              })}

              {isChatSending && <div className="chat-status">Typing...</div>}
            </div>

            <form className="chat-form" onSubmit={handleChatSubmit}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask a question"
                aria-label="Ask the assistant a question"
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className="chat-toggle"
          onClick={() => setIsChatOpen((current) => !current)}
          aria-label="Open assistant"
        >
          <img src={LOGO_IMAGE} alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
