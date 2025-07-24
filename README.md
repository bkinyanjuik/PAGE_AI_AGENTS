# PAGE AI

PAGE AI is a Streamlit application that provides a web interface for a crew of AI agents. The application showcases the different agents, their roles, and allows users to interact with them.

## Features

- **Multi-agent AI crew:** A team of AI agents with different roles and expertise.
- **Web interface:** A user-friendly web interface built with Streamlit.
- **Chat interface:** A chat interface that allows users to interact with the AI agents.
- **Extensible:** The application is designed to be extensible, allowing you to add your own agents and tasks.

## Getting Started

To get started with PAGE AI, you'll need to have Python 3.7 or higher installed. You'll also need to have an API key from [OpenRouter](https://openrouter.ai/).

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/page-ai.git
   ```

2. **Install the dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your environment variables:**

   Create a copy of the `.env.example` file and name it `.env`. Then, add your OpenRouter API key to the `.env` file.

   ```bash
   cp .env.example .env
   ```

4. **Run the application:**

   ```bash
   streamlit run app.py
   ```

## Usage

Once the application is running, you can interact with the AI agents through the chat interface. You can also run the full crew on a mission by clicking the "Launch Full Crew Mission" button.

## Contributing

Contributions are welcome! If you have any ideas for how to improve the application, please open an issue or submit a pull request.
