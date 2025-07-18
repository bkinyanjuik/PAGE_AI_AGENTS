import streamlit as st
from page_ai_crew import page_ai_crew, llm
from crewai import Task

st.set_page_config(page_title="PAGE AI", layout="wide")

st.title("PAGE AI Agent Management")

# Sidebar for agent selection
st.sidebar.title("Agents")
selected_agent_role = st.sidebar.selectbox(
    "Select an agent to interact with:",
    [agent.role for agent in page_ai_crew.agents]
)

# Find the selected agent
selected_agent = next((agent for agent in page_ai_crew.agents if agent.role == selected_agent_role), None)

# Main area for chat
st.header(f"Chat with {selected_agent.role}")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("What is up?"):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Get response from the agent
    task = Task(description=prompt, agent=selected_agent, expected_output="A helpful response.")
    response = task.execute()

    # Display assistant response in chat message container
    with st.chat_message("assistant"):
        st.markdown(response)
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": response})


# "Run Crew" button
if st.sidebar.button("Run Crew"):
    with st.spinner("Kicking off the crew..."):
        result = page_ai_crew.kickoff()
        st.sidebar.success("Crew run finished.")
        st.sidebar.write(result)
