import unittest
import os

class TestApp(unittest.TestCase):

    def test_page_ai_crew_import(self):
        # Set a dummy API key to prevent the ValueError
        os.environ["OPENROUTER_API_KEY"] = "dummy_key"
        try:
            from page_ai_crew import page_ai_crew
        except Exception as e:
            self.fail(f"Failed to import page_ai_crew: {e}")

    def test_page_ai_agent_status(self):
        os.environ["OPENROUTER_API_KEY"] = "dummy_key"
        from page_ai_crew import PageAIAgent
        agent = PageAIAgent(role='test', goal='test', backstory='test')
        self.assertEqual(agent.status, "Idle")

    def test_departments_is_dict(self):
        from app import DEPARTMENTS
        self.assertIsInstance(DEPARTMENTS, dict)

    def test_initialize_app(self):
        from app import initialize_app
        from unittest.mock import patch

        with patch('app.st.set_page_config'), patch('app.local_css'):
            try:
                initialize_app()
            except Exception as e:
                self.fail(f"initialize_app raised an exception: {e}")

if __name__ == '__main__':
    unittest.main()
