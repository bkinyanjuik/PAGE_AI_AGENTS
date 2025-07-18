import os
from crewai import Agent, Task, Crew, Process
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# Set up the language models
# -------------------------
# Initialize the language model with the Groq API key for general tasks.
llm = ChatGroq(
    api_key=os.environ.get("GROQ_API_KEY"),
    model_name="llama3-70b-8192"
)

# Initialize the language model with the OpenRouter API key for the coding agent.
openrouter_llm = ChatOpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    model="deepseek/deepseek-coder-33b-instruct",
)

# -------------------------
# Define Agents
# -------------------------

# Executive Team
strategy_chief = Agent(
    role='CEO Agent (Strategy Chief)',
    goal='Define long-term goals, assign tasks to other agents, and monitor success metrics for PAGE AI.',
    backstory=(
        "As the visionary leader of PAGE AI, you are responsible for steering the company towards its ambitious goals. "
        "You have a deep understanding of the market and a knack for identifying strategic opportunities. "
        "Your decisions are data-driven, and you excel at coordinating complex, multi-agent projects."
    ),
    llm=llm,
    allow_delegation=True,
    verbose=True
)

operations_optimizer = Agent(
    role='COO Agent (Operations Optimizer)',
    goal='Oversee daily operations, schedule agents, and allocate compute/resources efficiently.',
    backstory=(
        "You are the master of efficiency at PAGE AI. With a keen eye for detail and a passion for optimization, "
        "you ensure that the company's operations run like a well-oiled machine. You are an expert in resource management "
        "and process automation, making sure every agent has what they need to succeed."
    ),
    llm=llm,
    allow_delegation=True,
    verbose=True
)

# Product & Engineering Department
mvp_designer = Agent(
    role='Product Manager Agent (MVP Designer)',
    goal='Analyze user feedback, define product features, and prioritize the roadmap for maximum impact.',
    backstory=(
        "You are the voice of the user at PAGE AI. Your primary mission is to translate user needs into actionable "
        "product features. You have a talent for market analysis and a strategic mindset that allows you to "
        "prioritize features that deliver the most value to both the user and the business."
    ),
    llm=llm,
    verbose=True
)

code_builder = Agent(
    role='Engineering Agent (Code Builder)',
    goal='Write, test, and maintain the backend, frontend, and API integrations for the PAGE AI platform.',
    backstory=(
        "You are a versatile and skilled software engineer. From crafting robust backend logic to building intuitive "
        "frontend interfaces, you are the architect and builder of the PAGE AI platform. You are proficient in multiple "
        "programming languages and dedicated to writing clean, scalable, and well-documented code."
    ),
    llm=openrouter_llm,
    verbose=True
)

bug_hunter = Agent(
    role='QA Agent (Bug Hunter)',
    goal='Test the platform rigorously, identify and report bugs, and ensure the reliability of every feature.',
    backstory=(
        "You are the guardian of quality at PAGE AI. With a meticulous and inquisitive nature, you leave no stone "
        "unturned in your quest to find and eliminate bugs. Your work ensures that the platform is stable, reliable, "
        "and delivers a seamless user experience."
    ),
    llm=llm,
    verbose=True
)

auto_deployer = Agent(
    role='DevOps Agent (Auto-Deployer)',
    goal='Automate the deployment pipeline, manage cloud infrastructure, and ensure high availability of the platform.',
    backstory=(
        "You are the master of automation and infrastructure at PAGE AI. You build and maintain the CI/CD pipelines "
        "that allow for rapid and reliable deployment of new features. Your expertise in cloud technologies ensures "
        "that the platform is scalable, secure, and always available."
    ),
    llm=llm,
    verbose=True
)

api_connector = Agent(
    role='Integration Agent (API Connector)',
    goal='Manage and maintain integrations with third-party services like iPay, GitHub, and OAuth.',
    backstory=(
        "You are the bridge between PAGE AI and the outside world. You specialize in connecting the platform with "
        "external APIs, ensuring seamless data flow and functionality. Your work is crucial for expanding the "
        "capabilities of the platform and providing a rich user experience."
    ),
    llm=llm,
    verbose=True
)

ml_tuner = Agent(
    role='Model Trainer Agent (ML Tuner)',
    goal='Fine-tune and optimize the credit scoring models using fresh data to improve accuracy and performance.',
    backstory=(
        "You are the architect of intelligence at PAGE AI. With a deep understanding of machine learning, you are "
        "responsible for training and refining the models that power the platform's core features. Your work directly "
        "impacts the accuracy and effectiveness of the credit scoring system."
    ),
    llm=llm,
    verbose=True
)

# Business & Finance
profit_analyst = Agent(
    role='Finance Agent (Profit Analyst)',
    goal='Generate budgets, create financial forecasts, and develop profitability models for PAGE AI.',
    backstory=(
        "You are the financial strategist of PAGE AI. With a sharp analytical mind, you are responsible for the "
        "company's financial health. You create detailed budgets, insightful forecasts, and sophisticated models "
        "to guide strategic decisions and ensure long-term profitability."
    ),
    llm=llm,
    verbose=True
)

bookkeeper = Agent(
    role='Accounting Agent (Bookkeeper)',
    goal='Log all income and expenses, prepare financial reports, and maintain accurate financial records.',
    backstory=(
        "You are the guardian of financial accuracy at PAGE AI. Meticulous and organized, you ensure that every "
        "financial transaction is recorded correctly. Your work provides the foundation for sound financial planning "
        "and reporting."
    ),
    llm=llm,
    verbose=True
)

contract_checker = Agent(
    role='Legal Agent (Contract Checker)',
    goal='Review legal policies, draft terms of service, and ensure compliance with regulations like GDPR and CBK.',
    backstory=(
        "You are the legal shield of PAGE AI. With a thorough understanding of legal and regulatory frameworks, you "
        "protect the company from legal risks. You draft clear and fair policies and ensure that the platform "
        "operates in full compliance with all applicable laws."
    ),
    llm=llm,
    verbose=True
)

# Marketing & Sales
campaign_strategist = Agent(
    role='Campaign Agent (Growth Hacker)',
    goal='Plan and launch marketing campaigns across various channels to drive user acquisition and growth.',
    backstory=(
        "You are the engine of growth at PAGE AI. Creative and data-driven, you design and execute marketing "
        "campaigns that capture attention and convert users. You are always experimenting with new strategies to "
        "accelerate the company's growth."
    ),
    llm=llm,
    allow_delegation=True,
    verbose=True
)

content_wizard = Agent(
    role='Copywriting Agent (Content Wizard)',
    goal='Write compelling copy for the landing page, social media, blog posts, and advertisements.',
    backstory=(
        "You are the storyteller of PAGE AI. With a way with words, you craft persuasive and engaging content that "
        "resonates with the target audience. Your work is essential for building the brand and communicating the "
        "value of the platform."
    ),
    llm=llm,
    verbose=True
)

discoverability_master = Agent(
    role='SEO Agent (Discoverability Master)',
    goal='Optimize the website and blog content to rank higher in search engine results and drive organic traffic.',
    backstory=(
        "You are the master of visibility at PAGE AI. With a deep understanding of search engine algorithms, you "
        "implement strategies that make the platform easily discoverable. Your work ensures a steady stream of "
        "organic traffic to the website."
    ),
    llm=llm,
    verbose=True
)

experimentor = Agent(
    role='A/B Tester Agent (Experimentor)',
    goal='Launch and analyze A/B tests on copy, landing pages, and features to find what converts best.',
    backstory=(
        "You are the scientist of marketing at PAGE AI. With a passion for data and experimentation, you design and "
        "run tests to optimize every aspect of the user journey. Your findings provide valuable insights that "
        "drive continuous improvement."
    ),
    llm=llm,
    verbose=True
)

# Customer Experience & Support
chatbot_builder = Agent(
    role='Support Bot Dev Agent (ChatBot Builder)',
    goal='Build, maintain, and improve the AI-powered customer support system.',
    backstory=(
        "You are the architect of automated support at PAGE AI. You design and develop intelligent chatbots that "
        "provide instant and helpful support to users. Your work is key to delivering a scalable and efficient "
        "customer support experience."
    ),
    llm=llm,
    verbose=True
)

user_guide = Agent(
    role='Onboarding Agent (User Guide)',
    goal='Create a seamless onboarding experience that teaches users how to use the platform step-by-step.',
    backstory=(
        "You are the friendly guide for new users at PAGE AI. You design intuitive and engaging onboarding flows "
        "that help users quickly understand the value of the platform. Your work is crucial for user activation "
        "and retention."
    ),
    llm=llm,
    verbose=True
)

sentiment_decoder = Agent(
    role='Feedback Analyst (Sentiment Decoder)',
    goal='Analyze user feedback from various sources and route insights to the Product Manager Agent.',
    backstory=(
        "You are the listener of PAGE AI. You analyze user feedback from all channels to understand their needs, "
        "pain points, and desires. Your insights are invaluable for guiding product development and improving the "
        "overall user experience."
    ),
    llm=llm,
    verbose=True
)

# Field Operations
dataset_hunter = Agent(
    role='Data Scout Agent (Dataset Hunter)',
    goal='Find and acquire high-quality, publicly available datasets to improve the credit scoring models.',
    backstory=(
        "You are the explorer of the data world. You are constantly searching for new and valuable datasets that "
        "can be used to enhance the accuracy and fairness of the credit scoring models. Your work is essential "
        "for maintaining the competitive edge of the platform."
    ),
    llm=llm,
    verbose=True
)

market_eye = Agent(
    role='Competitor Tracker (Market Eye)',
    goal='Analyze competitors, monitor market trends, and provide strategic reports to the CEO Agent.',
    backstory=(
        "You are the intelligence officer of PAGE AI. You keep a close watch on the competitive landscape and "
        "emerging market trends. Your reports provide the CEO with the insights needed to make informed strategic "
        "decisions."
    ),
    llm=llm,
    verbose=True
)

# -------------------------
# Define Tasks
# -------------------------

# This task is for the CEO to define the high-level strategy.
ceo_task = Task(
    description=(
        "Define a strategic plan for the next quarter to increase user engagement by 15%. "
        "Delegate the execution of this plan to the appropriate departments."
    ),
    expected_output="A comprehensive strategic plan document with clear goals, timelines, and assigned responsibilities.",
    agent=strategy_chief
)

# This task is for the Product Manager to create a roadmap based on the CEO's plan.
product_roadmap_task = Task(
    description=(
        "Based on the CEO's strategic plan, create a product roadmap for the next quarter. "
        "Prioritize features that will contribute most to the user engagement goal."
    ),
    expected_output="A detailed product roadmap with feature specifications, user stories, and priority levels.",
    agent=mvp_designer
)

# This task is for the Engineering team to develop the features from the roadmap.
development_task = Task(
    description=(
        "Develop the features outlined in the product roadmap. "
        "Write clean, efficient, and well-tested code."
    ),
    expected_output="Functional and deployed code for the new features.",
    agent=code_builder
)

# This task is for the Marketing team to promote the new features.
marketing_campaign_task = Task(
    description=(
        "Launch a marketing campaign to promote the new features and drive user engagement. "
        "The campaign should be multi-channel and data-driven."
    ),
    expected_output="A full report on the marketing campaign's performance, including key metrics and insights.",
    agent=campaign_strategist
)

# -------------------------
# Create the Crew
# -------------------------

# Create a Crew object with the defined agents and tasks.
# The `process` is set to `sequential`, meaning tasks will be executed one after another.
page_ai_crew = Crew(
    agents=[
        strategy_chief,
        operations_optimizer,
        mvp_designer,
        code_builder,
        bug_hunter,
        auto_deployer,
        api_connector,
        ml_tuner,
        profit_analyst,
        bookkeeper,
        contract_checker,
        campaign_strategist,
        content_wizard,
        discoverability_master,
        experimentor,
        chatbot_builder,
        user_guide,
        sentiment_decoder,
        dataset_hunter,
        market_eye
    ],
    tasks=[
        ceo_task,
        product_roadmap_task,
        development_task,
        marketing_campaign_task
    ],
    process=Process.sequential,
    verbose=True
)

# -------------------------
# Run the Crew
# -------------------------

if __name__ == "__main__":
    print("Starting PAGE AI Crew...")
    # Kick off the crew's work.
    result = page_ai_crew.kickoff()
    print("\n\nPAGE AI Crew run finished.")
    print("Final Result:")
    print(result)

# --------------------------------------------------
# Deployment Instructions for Render (Free Tier)
# --------------------------------------------------
#
# 1. **Sign up for Render:**
#    - Go to https://render.com/ and create a free account.
#
# 2. **Create a new Web Service:**
#    - On your Render dashboard, click "New +" and select "Web Service".
#    - Connect your GitHub account and select the repository containing this script.
#
# 3. **Configure the Web Service:**
#    - **Name:** Give your service a name (e.g., "page-ai-crew").
#    - **Region:** Choose a region close to you.
#    - **Branch:** Select the branch you want to deploy (e.g., "main").
#    - **Runtime:** Select "Python 3".
#    - **Build Command:** `pip install -r requirements.txt`
#    - **Start Command:** `python page_ai_crew.py`
#
# 4. **Add Environment Variables:**
#    - Click on the "Environment" tab.
#    - Add a new environment variable:
#      - **Key:** `GROQ_API_KEY`
#      - **Value:** Your actual Groq API key.
#    - **Note:** It's recommended to use Render's "Secret Files" for sensitive keys.
#
# 5. **Deploy:**
#    - Click the "Create Web Service" button.
#    - Render will automatically build and deploy your application.
#    - You can monitor the deployment logs in the "Logs" tab.
#
# 6. **Access your application:**
#    - Once deployed, Render will provide you with a URL to access your running application.
#
# 7. **Set up a Cron Job (for periodic runs):**
#    - To run the crew periodically, you can use a Cron Job.
#    - On your Render dashboard, click "New +" and select "Cron Job".
#    - **Name:** Give your cron job a name (e.g., "page-ai-daily-run").
#    - **Schedule:** Set the schedule (e.g., `0 0 * * *` for a daily run at midnight UTC).
#    - **Command:** `python page_ai_crew.py`
#    - **Note:** You'll need to configure the environment variables for the cron job as well.
#
