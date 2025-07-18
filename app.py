import streamlit as st
from page_ai_crew import page_ai_crew
from crewai import Task, Crew
import logging
from io import StringIO
import time

# Set up logging
log_stream = StringIO()
logging.basicConfig(stream=log_stream, level=logging.INFO)

# Page configuration with custom icon and layout
st.set_page_config(
    page_title="PAGE AI | Enterprise AI Agent Platform", 
    layout="wide",
    page_icon="🤖",
    initial_sidebar_state="expanded"
)

def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Load custom CSS
local_css("style.css")

# Hero Section
st.markdown("""
<div class="hero-section">
    <div class="hero-content">
        <div class="hero-title">
            <span class="title-main">PAGE AI</span>
            <span class="title-sub">Enterprise Agent Platform</span>
        </div>
        <div class="hero-subtitle">
            Transforming Organizations with Intelligent AI Agents
        </div>
        <div class="hero-tagline">
            The Future of Autonomous Business Operations
        </div>
    </div>
    <div class="floating-particles"></div>
</div>
""", unsafe_allow_html=True)

# Metrics Dashboard
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">20</div>
        <div class="metric-label">AI Agents</div>
        <div class="metric-sublabel">Active Workforce</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">98.7%</div>
        <div class="metric-label">Efficiency</div>
        <div class="metric-sublabel">Operational Gain</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">24/7</div>
        <div class="metric-label">Uptime</div>
        <div class="metric-sublabel">Continuous Operations</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">∞</div>
        <div class="metric-label">Scalability</div>
        <div class="metric-sublabel">Unlimited Growth</div>
    </div>
    """, unsafe_allow_html=True)

# Main Content Area
col_left, col_right = st.columns([1, 2])

with col_left:
    st.markdown("""
    <div class="sidebar-section">
        <h2 class="section-title">
            <span class="title-icon">🎯</span>
            Agent Command Center
        </h2>
    </div>
    """, unsafe_allow_html=True)
    
    # Agent categorization
    agent_categories = {
        "🏢 Executive Leadership": ["CEO Agent (Strategy Chief)", "COO Agent (Operations Optimizer)"],
        "⚡ Product & Engineering": ["Product Manager Agent (MVP Designer)", "Engineering Agent (Code Builder)", 
                                   "QA Agent (Bug Hunter)", "DevOps Agent (Auto-Deployer)", 
                                   "Integration Agent (API Connector)", "Model Trainer Agent (ML Tuner)"],
        "💼 Business & Finance": ["Finance Agent (Profit Analyst)", "Accounting Agent (Bookkeeper)", 
                                 "Legal Agent (Contract Checker)"],
        "🚀 Marketing & Growth": ["Campaign Agent (Growth Hacker)", "Copywriting Agent (Content Wizard)", 
                                 "SEO Agent (Discoverability Master)", "A/B Tester Agent (Experimentor)"],
        "🎯 Customer Experience": ["Support Bot Dev Agent (ChatBot Builder)", "Onboarding Agent (User Guide)", 
                                  "Feedback Analyst (Sentiment Decoder)"],
        "🔍 Intelligence & Analytics": ["Data Scout Agent (Dataset Hunter)", "Competitor Tracker (Market Eye)"]
    }
    
    selected_category = st.selectbox(
        "Select Department",
        list(agent_categories.keys()),
        help="Choose an agent department to explore"
    )
    
    if selected_category:
        available_agents = agent_categories[selected_category]
        selected_agent_role = st.selectbox(
            "Select Agent",
            available_agents,
            help="Choose a specific agent to interact with"
        )
        
        # Find the selected agent
        selected_agent = next((agent for agent in page_ai_crew.agents if agent.role == selected_agent_role), None)
        
        if selected_agent:
            st.markdown(f"""
            <div class="agent-card">
                <div class="agent-name">{selected_agent.role}</div>
                <div class="agent-goal">{selected_agent.goal}</div>
                <div class="agent-status">
                    <span class="status-indicator active"></span>
                    Status: Active & Ready
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Crew Operations
    st.markdown("""
    <div class="section-divider"></div>
    <div class="sidebar-section">
        <h2 class="section-title">
            <span class="title-icon">⚡</span>
            Crew Operations
        </h2>
    </div>
    """, unsafe_allow_html=True)
    
    if st.button("🚀 Execute Full Crew Mission", type="primary", use_container_width=True):
        with st.spinner("Initializing enterprise-wide AI operations..."):
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for i in range(100):
                time.sleep(0.02)
                progress_bar.progress(i + 1)
                if i < 25:
                    status_text.text("Analyzing market conditions...")
                elif i < 50:
                    status_text.text("Coordinating departmental strategies...")
                elif i < 75:
                    status_text.text("Executing operational plans...")
                else:
                    status_text.text("Generating executive reports...")
            
            result = page_ai_crew.kickoff()
            st.success("✅ Mission Completed Successfully!")
            
            st.markdown("""
            <div class="result-card">
                <h3>📊 Mission Report</h3>
                <div class="result-content">
            """, unsafe_allow_html=True)
            st.write(result)
            st.markdown("</div></div>", unsafe_allow_html=True)

with col_right:
    st.markdown("""
    <div class="chat-section">
        <h2 class="section-title">
            <span class="title-icon">💬</span>
            AI Agent Communication Hub
        </h2>
    </div>
    """, unsafe_allow_html=True)
    
    if 'selected_agent' in locals() and selected_agent:
        st.markdown(f"""
        <div class="chat-header">
            <div class="agent-avatar">🤖</div>
            <div class="agent-info">
                <div class="agent-chat-name">{selected_agent.role}</div>
                <div class="agent-chat-status">Online • Ready to assist</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Initialize chat history
        if "messages" not in st.session_state:
            st.session_state.messages = []
            # Add welcome message
            st.session_state.messages.append({
                "role": "assistant", 
                "content": f"Hello! I'm {selected_agent.role}. {selected_agent.goal} How can I assist you today?"
            })

        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(f'<div class="message-content">{message["content"]}</div>', unsafe_allow_html=True)

        # Chat input
        if prompt := st.chat_input("Ask your AI agent anything..."):
            # Display user message
            st.chat_message("user").markdown(f'<div class="message-content">{prompt}</div>', unsafe_allow_html=True)
            st.session_state.messages.append({"role": "user", "content": prompt})

            # Process with AI agent
            with st.chat_message("assistant"):
                with st.spinner("🧠 AI Agent is thinking..."):
                    task = Task(
                        description=prompt, 
                        agent=selected_agent, 
                        expected_output="A comprehensive, professional response that demonstrates the agent's expertise."
                    )
                    temp_crew = Crew(
                        agents=[selected_agent],
                        tasks=[task],
                        verbose=False
                    )
                    response = temp_crew.kickoff()
                    st.markdown(f'<div class="message-content">{response}</div>', unsafe_allow_html=True)
                    st.session_state.messages.append({"role": "assistant", "content": response})
    else:
        st.markdown("""
        <div class="placeholder-chat">
            <div class="placeholder-icon">🤖</div>
            <h3>Select an AI Agent to Begin</h3>
            <p>Choose an agent from the command center to start your conversation with the future of organizational intelligence.</p>
        </div>
        """, unsafe_allow_html=True)

# Footer
st.markdown("""
<div class="footer">
    <div class="footer-content">
        <div class="footer-left">
            <span class="footer-logo">PAGE AI</span>
            <span class="footer-text">Pioneering the Future of Enterprise AI</span>
        </div>
        <div class="footer-right">
            <span class="footer-stats">Powered by Advanced Language Models | Real-time Processing</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)
