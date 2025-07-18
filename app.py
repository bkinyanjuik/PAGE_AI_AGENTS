import streamlit as st
from page_ai_crew import page_ai_crew
from crewai import Task, Crew
import logging
from io import StringIO

# Set up logging
log_stream = StringIO()
logging.basicConfig(stream=log_stream, level=logging.INFO)

st.set_page_config(page_title="PAGE AI", layout="wide")

def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("style.css")

# --- Sidebar ---
st.sidebar.title("PAGE AI")
st.sidebar.markdown("---")

# Agent selection
st.sidebar.header("Agents")
selected_agent_role = st.sidebar.selectbox(
    "Select an agent:",
    [agent.role for agent in page_ai_crew.agents]
)
selected_agent = next((agent for agent in page_ai_crew.agents if agent.role == selected_agent_role), None)

st.sidebar.markdown("---")

# Run Crew button
if st.sidebar.button("Run Full Crew"):
    with st.spinner("The crew is on a mission..."):
        result = page_ai_crew.kickoff()
        st.sidebar.success("Mission Accomplished!")
        st.sidebar.expander("View Results").write(result)

st.sidebar.markdown("---")

# Logs
st.sidebar.header("Activity Logs")
logs_container = st.sidebar.expander("View Logs")
log_stream.seek(0)
logs_container.text(log_stream.read())


# --- Main Chat Area ---
st.header(f"Chat with {selected_agent.role}")
st.markdown("---")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
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
