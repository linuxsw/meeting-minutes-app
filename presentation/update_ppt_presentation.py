from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def add_title_slide(prs, title_text, subtitle_text):
    slide_layout = prs.slide_layouts[0]  # Title Slide layout
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    title.text = title_text
    subtitle.text = subtitle_text

def add_content_slide(prs, title_text, content_list):
    slide_layout = prs.slide_layouts[5]  # Title and Content layout (or 1 for Title and Content)
    slide = prs.slides.add_slide(slide_layout)
    title = slide.shapes.title
    title.text = title_text

    body_shape = slide.shapes.placeholders[1]
    tf = body_shape.text_frame
    tf.clear() # Clear existing content

    for item in content_list:
        p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(18)
        p.level = 0

# Path to the existing presentation and the new one
existing_ppt_path = "/home/ubuntu/meeting-minutes-app/presentation/Meeting_Minutes_Proposal_Final.pptx"
updated_ppt_path = "/home/ubuntu/meeting-minutes-app/presentation/Meeting_Minutes_Proposal_Final_v2.pptx"

# Load the existing presentation
try:
    prs = Presentation(existing_ppt_path)
except Exception as e:
    print(f"Error loading presentation {existing_ppt_path}: {e}")
    # If loading fails, create a new presentation as a fallback
    print("Creating a new presentation as fallback.")
    prs = Presentation()
    add_title_slide(prs, "Meeting Minutes Generator - Enhanced", "IP, Privacy, and Authentication Update")

# --- Slide 1: IP & Data Privacy Overview ---
slide_title_ip_privacy = "Intellectual Property & Data Privacy"
content_ip_privacy = [
    "Application prioritizes your data privacy and IP.",
    "Core Audio Processing (Transcription, Diarization):",
    "  - Uses local SpeechBrain; NO audio sent to third parties.",
    "  - Original audio/video content remains within your control.",
    "Optional AI Enhancements (Summarization, etc.):",
    "  - Text-based transcript may be sent to selected AI provider.",
    "  - Cloud Providers (OpenAI, Together AI): Users own input/output; data NOT used for training by default.",
    "  - Local AI (Ollama): Data remains within your local environment.",
    "User Control: Clear choice of AI provider, including 'No AI' option.",
    "Recommendation: For highly sensitive content, use local processing or local AI (Ollama).",
    "Refer to IP_AND_PRIVACY.md for full details."
]
add_content_slide(prs, slide_title_ip_privacy, content_ip_privacy)

# --- Slide 2: Security Measures & Best Practices ---
slide_title_security = "Data Security Measures & Best Practices"
content_security = [
    "Data in Transit: HTTPS used for all client-server and server-external API communication.",
    "Data at Rest (Application Server):",
    "  - Uploaded audio files are temporary and deleted after processing.",
    "  - No long-term server-side storage of full transcripts/documents by default.",
    "User Responsibility: Regularly review AI provider terms and privacy policies.",
    "Transparency: UI provides warnings when data is sent to cloud AI services.",
    "Refer to PRIVACY.md for general application privacy policy."
]
add_content_slide(prs, slide_title_security, content_security)

# --- Slide 3: SSO/AD Integration Strategy ---
slide_title_sso_ad = "Authentication: SSO/AD Integration Strategy"
content_sso_ad = [
    "Current Status: Guest mode for testing and initial use.",
    "Future Enhancement: Designed for enterprise authentication.",
    "Potential Integration Options:",
    "  - OAuth 2.0 / OpenID Connect (OIDC): Standard for modern SSO.",
    "  - SAML 2.0: Widely used for enterprise federation.",
    "  - LDAP / Active Directory Integration: For direct AD lookup.",
    "Benefits of Integration:",
    "  - Centralized user management and access control.",
    "  - Enhanced security and compliance with corporate policies.",
    "  - Single sign-on experience for users.",
    "Implementation Considerations:",
    "  - Requires backend changes and potentially new libraries (e.g., Passport.js for Node.js, or equivalent for Python if backend changes).",
    "  - Configuration for specific Identity Providers (IdPs) like Azure AD, Okta, etc.",
    "  - Secure handling of tokens and sessions."
]
add_content_slide(prs, slide_title_sso_ad, content_sso_ad)

# Save the updated presentation
prs.save(updated_ppt_path)
print(f"Presentation updated and saved to {updated_ppt_path}")

