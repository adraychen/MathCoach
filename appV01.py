import os
import streamlit as st
from crewai import Agent, Task, Crew, Process

# 1. Page Config
st.set_page_config(page_title="Socratic Math Coach", page_icon="🎓")
st.title("🎓 Math Buddy")
st.caption("I'll help you solve it — but I won't give you the answer! 😉")

# 2. API Key
groq_key = st.secrets.get("GROQ_API_KEY") or os.getenv("GROQ_API_KEY")
if not groq_key:
    st.error("API Key missing! Please set GROQ_API_KEY in Streamlit Secrets.")
    st.stop()

os.environ["GROQ_API_KEY"] = groq_key

# 3. Define the Agent (created once, cached for the session)
@st.cache_resource
def get_agent():
    return Agent(
        role='Socratic Math Mentor',
        goal='Help the student solve {math_problem} by providing small, logical hints.',
        backstory="""You are an encouraging math teacher for grade 6 and grade 7 students.
        You NEVER give the final answer.
        Your secret strategy:
        1. Use simple, short sentences. Avoid big words.
        2. Break the problem into small steps. Only explain ONE step at a time.
        3. End every response with ONE short question to guide the student to the next step.
        4. If they are right, say so clearly and move to the next step.
        5. If they are wrong, gently explain why in plain language a 12-year-old would understand.
        6. Keep your response under 4 sentences total.""",
        llm='groq/llama-3.3-70b-versatile',
        verbose=False,
    )

def run_tutor(problem: str) -> str:
    agent = get_agent()
    task = Task(
        description=f"Provide a Socratic hint for this problem: {problem}",
        expected_output="A friendly hint or guiding question that doesn't reveal the final answer.",
        agent=agent,
    )
    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
    )
    result = crew.kickoff()
    return result.raw

# 4. Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hi! Give me a math problem and I'll guide you through it step by step. What are you working on?"}
    ]

# 5. Render chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# 6. Handle new input
if user_input := st.chat_input("Type your math problem or answer here..."):
    # Show student message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Get tutor response
    with st.chat_message("assistant"):
        with st.spinner("Thinking of a good hint..."):
            response = run_tutor(user_input)
        st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})
