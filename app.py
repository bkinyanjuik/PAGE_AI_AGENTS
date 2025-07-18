import streamlit as st
from page_ai_crew import page_ai_crew
from crewai import Task, Crew
import logging
from io import StringIO
import time

# Set up logging
log_stream = StringIO()
logging.basicConfig(stream=log_stream, level=logging.INFO)

st.set_page_config(page_title="PAGE AI - The Future of Organizational AI", layout="wide")

def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("style.css")

# --- Hero Section ---
st.markdown('<div id="particles-js"></div>', unsafe_allow_html=True)
st.title("PAGE AI: The Future of Organizational AI")
st.markdown(
    "<h2 class='gradient-text'>A sophisticated enterprise platform that demonstrates the future of organizational AI.</h2>",
    unsafe_allow_html=True
)
st.markdown("---")

# --- Live Metrics Dashboard ---
st.header("Live Metrics Dashboard")
col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("<div class='glass-morphism'><h3>Active Agents</h3><h2>20</h2></div>", unsafe_allow_html=True)
with col2:
    st.markdown("<div class='glass-morphism'><h3>Efficiency</h3><h2>98.7%</h2></div>", unsafe_allow_html=True)
with col3:
    st.markdown("<div class='glass-morphism'><h3>Uptime</h3><h2>24/7</h2></div>", unsafe_allow_html=True)
st.markdown("---")


# --- Agent Command Center ---
st.header("Agent Command Center")

# Departmental organization
departments = {
    "Executive Team": ["CEO Agent (Strategy Chief)", "COO Agent (Operations Optimizer)"],
    "Product & Engineering": [
        "Product Manager Agent (MVP Designer)", "Engineering Agent (Code Builder)", "QA Agent (Bug Hunter)",
        "DevOps Agent (Auto-Deployer)", "Integration Agent (API Connector)", "Model Trainer Agent (ML Tuner)"
    ],
    "Business & Finance": ["Finance Agent (Profit Analyst)", "Accounting Agent (Bookkeeper)", "Legal Agent (Contract Checker)"],
    "Marketing & Sales": [
        "Campaign Agent (Growth Hacker)", "Copywriting Agent (Content Wizard)", "SEO Agent (Discoverability Master)",
        "A/B Tester Agent (Experimentor)"
    ],
    "Customer Experience & Support": [
        "Support Bot Dev Agent (ChatBot Builder)", "Onboarding Agent (User Guide)", "Feedback Analyst (Sentiment Decoder)"
    ],
    "Field Operations": ["Data Scout Agent (Dataset Hunter)", "Competitor Tracker (Market Eye)"]
}

for dept, agent_roles in departments.items():
    with st.expander(f"**{dept}**"):
        cols = st.columns(3)
        for i, role in enumerate(agent_roles):
            agent = next((a for a in page_ai_crew.agents if a.role == role), None)
            if agent:
                with cols[i % 3]:
                    st.markdown(
                        f"""
                        <div class='glass-morphism agent-card'>
                            <h4>{agent.role} <span class='status-indicator'></span></h4>
                            <p>{agent.goal}</p>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )

st.markdown("---")

# --- Mission Execution & Chat ---
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Mission Execution")
    # Placeholder for mission progress
    st.markdown("<div class='glass-morphism'>Mission progress will be displayed here.</div>", unsafe_allow_html=True)


with col2:
    st.header("Communication Hub")
    selected_agent_role = st.selectbox(
        "Select an agent to chat with:",
        [agent.role for agent in page_ai_crew.agents]
    )
    selected_agent = next((agent for agent in page_ai_crew.agents if agent.role == selected_agent_role), None)

    # Chat interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input(f"Message {selected_agent.role}..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            with st.spinner("Thinking..."):
                task = Task(description=prompt, agent=selected_agent, expected_output="A helpful response.")
                temp_crew = Crew(
                    agents=[selected_agent],
                    tasks=[task],
                    verbose=True
                )
                response = temp_crew.kickoff()
                message_placeholder.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})

# --- Run Full Crew Button ---
if st.button("Launch Full Crew Mission"):
    with st.spinner("The crew is on a mission..."):
        result = page_ai_crew.kickoff()
        st.success("Mission Accomplished!")
        st.expander("View Mission Results").write(result)

# --- Activity Logs ---
st.sidebar.header("Activity Logs")
logs_container = st.sidebar.expander("View Logs")
log_stream.seek(0)
logs_container.text(log_stream.read())

# Load particles.js
st.markdown(
    """
    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
    <script>
        particlesJS("particles-js", {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 6,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "repulse"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 400,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    </script>
    """,
    unsafe_allow_html=True
)
