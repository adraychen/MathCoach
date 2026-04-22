import streamlit as st
from crewai import Agent, Task, Crew
import os

# 1. Page Config
st.set_page_config(page_title="Socratic Math Coach", page_icon="🎓")
st.title("🎓 Mr. Ray's Socratic Math Coach")
st.markdown("I'll help you solve it, but I won't give you the answer! 😉")

# 2. Get API Key from Secrets (Streamlit Cloud uses st.secrets)
# This falls back to environment variables for local testing
groq_key = st.secrets.get("GROQ_API_KEY") or os.getenv("GROQ_API_KEY")

if not groq_key:
    st.error("API Key missing! Please set GROQ_API_KEY in Streamlit Secrets.")
else:
    # Set the environment variable for CrewAI/LiteLLM to pick up
    os.environ["GROQ_API_KEY"] = groq_key

    # 3. Setup the Agent
    tutor_agent = Agent(
        role='Socratic Math Mentor',
        goal='Help the student solve {math_problem} by providing small, logical hints.',
        backstory="""You are an encouraging high school math teacher.
        You NEVER give the final answer.
        Your secret strategy:
        1. Break the problem into steps (Chain of Thought).
        2. Only explain the logic for the CURRENT step.
        3. Ask the student a question to lead them to the next step.
        4. If they are right, move to the next hint.
        5. If they are wrong, explain why gently.""",
        llm='groq/llama-3.3-70b-versatile',
        # verbose=True # This lets you see the agent "thinking" in the logs
        )

    # 4. Web Interface
    with st.form("chat_form"):
        user_input = st.text_input("Enter your math question:")
        submitted = st.form_submit_with_button("Get a Hint")

        if submitted and user_input:
            with st.spinner("Thinking of a good hint..."):
                task = Task(description=f"Provide a Socratic hint for this math problem: {user_input}", agent=tutor_agent)
                crew = Crew(agents=[tutor_agent], tasks=[task])
                response = crew.kickoff()
                st.write("### Tutor's Hint:")
                st.info(response)
